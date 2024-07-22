import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import tesseractRoutes from './Tesseract.js';
import recipeRoutes from './recipes.js';

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
