import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import tesseractRoutes from './Tesseract.js';
import recipeRoutes from './recipes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', tesseractRoutes); // Ensure this matches the endpoint being called
app.use('/recipes', recipeRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
