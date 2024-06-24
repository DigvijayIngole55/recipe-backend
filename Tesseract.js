const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const tesseract = require('tesseract.js');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

let ingredientsFilePath = path.join(__dirname, '../ingredients.json'); // Adjust path as needed
if (!fs.existsSync(ingredientsFilePath)) {
    fs.writeFileSync(ingredientsFilePath, JSON.stringify({ ingredients: [] }, null, 2));
}

let commonIngredients = new Set(require(ingredientsFilePath).ingredients);

// Patterns to exclude common non-ingredient text
const excludePatterns = [
  /^\d+$/,            // Numbers (quantities, prices)
  /^\d+\.\d+$/,       // Prices with decimal points
  /^[\$£€¥]\d+$/,     // Prices with currency symbols
  /^[a-zA-Z]{1,2}$/,  // Single or double letters
  /^x\d+$/,           // Quantity with 'x' prefix (e.g., x2, x3)
  /^lb$/,             // Pound unit
  /^(oz|kg|g|ml|l)$/, // Weight/Volume units
  /^large$/i,         // Size
  /^small$/i,         // Size
  /^(san|diego|ca|store|supermarket|total)$/i, // Common non-ingredient words
  /^(supermarket|store|grocery|total|paper|wipes)$/i // More common store-related words
];

// Additional non-ingredient terms to exclude
const nonIngredients = new Set([
  'supermarket', 'store', 'total', 'san', 'diego', 'ca', 'paper', 'wipes'
]);

router.post('/upload', upload.single('image'), async (req, res) => {
    console.log('Received a new request to /upload');
    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).send({ message: 'Please upload an image.' });
    }

    try {
        console.log('Processing the uploaded image...');
        const { data: { text } } = await tesseract.recognize(path.join(__dirname, req.file.path));
        console.log('OCR Text:', text);

        // Extract words from the recognized text and convert to lowercase
        const words = text.match(/[a-zA-Z]+/g).map(word => word.toLowerCase());
        console.log('Words extracted:', words);

        // Filter words to match common ingredients and remove non-ingredient patterns
        let ingredients = words.filter(word => commonIngredients.has(word) && !excludePatterns.some(pattern => pattern.test(word)));
        console.log('Filtered ingredients:', ingredients);

        // Add new ingredients to the dynamic list and update the JSON file
        const newIngredients = words.filter(word => !commonIngredients.has(word) && !excludePatterns.some (pattern => pattern.test(word)) && !nonIngredients.has(word));
        console.log('New ingredients to add:', newIngredients);
        
        if (newIngredients.length > 0) {
            newIngredients.forEach(ingredient => commonIngredients.add(ingredient));
            fs.writeFileSync(ingredientsFilePath, JSON.stringify({ ingredients: Array.from(commonIngredients) }, null, 2));
            console.log('Updated ingredients list:', Array.from(commonIngredients));
        }

        // Remove duplicates
        ingredients = [...new Set(ingredients)];
        console.log('Final ingredients list:', ingredients);

        res.send({ message: 'Image processed successfully.', ingredients });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send({ message: 'Error processing image.', error });
    }
});

module.exports = router;
