import express from 'express';
import multer from 'multer';
import path from 'path';

import tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(cors()); // Enable CORS

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

async function analyzeIngredients(text) {
  const prompt = `${text} from this list return ingredients that can be used as raw materials, remove brand name, measurements for cooking as a JSON response: {"ingredients": ["ingredient1", "ingredient2", ...]}`;

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  try {
    const result = await chatSession.sendMessage('Generate ingredient list.');
    let responseText = result.response.text();

    console.log('Response from Google Generative AI:', responseText); // Debugging line

    // Remove code block delimiters if they exist
    responseText = responseText.replace(/```json\n|\n```/g, '');

    // Parse the JSON response
    const jsonResponse = JSON.parse(responseText);

    // Check if the response structure matches the expected format
    if (!jsonResponse.ingredients || !Array.isArray(jsonResponse.ingredients)) {
      throw new Error('Response does not contain the expected JSON structure');
    }

    return jsonResponse;
  } catch (error) {
    console.error('Error from Google Generative AI:', error);
    throw error;
  }
}

router.post('/upload', upload.single('image'), async (req, res) => {
  console.log('Upload endpoint called');
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).send({ message: 'Please upload an image.' });
  }

  try {
    const filePath = path.resolve(req.file.path);
    const mimeType = req.file.mimetype;
    console.log('Uploaded file path:', filePath);
    console.log('Original file name:', req.file.originalname);
    console.log('Determined MIME type:', mimeType);

    // OCR processing using Tesseract.js
    const { data: { text } } = await tesseract.recognize(filePath);
    const ocrText = text.match(/[a-zA-Z]+/g).join(' ');

    // Analyze text with Google Generative AI to identify ingredients
    const ingredients = await analyzeIngredients(ocrText);

    res.status(200).json({ message: 'Image processed successfully.', ingredients: ingredients.ingredients });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'Error processing image.', error: error.toString() });
  }
});

export default router;
