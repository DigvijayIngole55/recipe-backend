import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http'; // Import http module to create the server
import tesseractRoutes from './Tesseract.js';
import recipeRoutes from './recipes.js';
import { Server } from 'socket.io';
import cloudinary from 'cloudinary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json());
app.use('/api', tesseractRoutes);
app.use('/recipes', recipeRoutes);
app.use('/uploads', express.static('uploads')); // Serve static files from uploads folder

const server = http.createServer(app);

// Set timeout to 120 seconds (120000 milliseconds)
server.setTimeout(120000);

// Initialize WebSocket server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Configure Cloudinary
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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
