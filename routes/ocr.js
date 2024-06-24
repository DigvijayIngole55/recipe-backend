const express = require('express');
const multer = require('multer');
const tesseract = require('tesseract.js');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload an image.' });
    }

    try {
        const { data: { text } } = await tesseract.recognize(path.join(__dirname, '../uploads/', req.file.filename));
        const ingredients = text.match(/[a-zA-Z]+/g); // Simple regex to extract words
        res.send({ message: 'Image processed successfully.', ingredients });
    } catch (error) {
        res.status(500).send({ message: 'Error processing image.', error });
    }
});

module.exports = router;
