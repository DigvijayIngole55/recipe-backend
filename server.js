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

const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/api', tesseractRoutes);
app.use('/recipes', recipeRoutes);
app.use('/images', imageRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
