import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import tesseractRoutes from './Tesseract.js';
import recipeRoutes from './recipes.js';
import imageRoutes from './image.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins (adjust as needed)
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/api', tesseractRoutes);
app.use('/recipes', recipeRoutes);
app.use('/images', imageRoutes);
app.use('/uploads', express.static('uploads')); // Serve static files from uploads folder

// Basic logging middleware to see incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
