import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http'; 
import tesseractRoutes from './Tesseract.js';
import recipeRoutes from './recipes.js';
import { Server } from 'socket.io';
import cloudinary from 'cloudinary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors()); 
app.use(bodyParser.json());
app.use('/api', tesseractRoutes);
app.use('/recipes', recipeRoutes);
app.use('/images', imagesRoutes);
app.use('/uploads', express.static('uploads')); 

const server = http.createServer(app);


server.setTimeout(120000);


const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.post('/recipes/generate-recipes', async (req, res) => {
  const { ingredients } = req.body;
  const recipes = await generateRecipes(ingredients);
  res.status(200).json({ recipes });

  fetchAndUploadImages(recipes, io);
});

// Import the existing functions from the recipes.js file
import { fetchRecipes, fetchImageFromGetImgAI } from './recipes.js';

async function fetchAndUploadImages(recipes, io) {
  for (const recipe of recipes) {
    const image = await fetchImageFromGetImgAI(`Image of ${recipe.name}`);
    if (image) {
      const result = await cloudinary.v2.uploader.upload(image, {
        folder: 'recipes',
        public_id: recipe.name
      });
      io.emit('image-ready', {
        recipeName: recipe.name,
        imageUrl: result.secure_url
      });
    }
  }
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
