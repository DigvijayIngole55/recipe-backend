const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const ocrRoutes = require('./Tesseract'); // Adjust the path as needed
const recipeRoutes = require('./routes/recipes'); // Import the recipes route

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON requests
app.use('/ocr', ocrRoutes);
app.use('/recipes', recipeRoutes); // Use the recipes route

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
