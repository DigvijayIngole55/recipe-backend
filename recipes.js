import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 50,
  maxOutputTokens: 1024,
};

const getImgAPIKeys = [
  process.env.GET_IMG_API_KEY_1,
  process.env.GET_IMG_API_KEY_2,
  process.env.GET_IMG_API_KEY_3,
  process.env.GET_IMG_API_KEY_4,
];

let apiKeyIndex = 0;

const fetchImageFromGetImgAI = async (prompt) => {
  const cacheDir = path.join(__dirname, 'cached_images');
  const cacheFilePath = path.join(cacheDir, `${prompt.replace(/\s+/g, '_')}.jpeg`);

  // Check if the image is already cached
  if (fs.existsSync(cacheFilePath)) {
    console.log(`Image found in cache for prompt: ${prompt}`);
    const imageBase64 = fs.readFileSync(cacheFilePath, { encoding: 'base64' });
    return `data:image/jpeg;base64,${imageBase64}`;
  }

  const url = 'https://api.getimg.ai/v1/stable-diffusion-xl/text-to-image';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${getImgAPIKeys[apiKeyIndex]}`,
    },
    body: JSON.stringify({
      model: 'stable-diffusion-xl-v1-0',
      prompt: prompt,
      negative_prompt: 'Disfigured, cartoon, blurry',
      width: 1024,
      height: 1024,
      steps: 30,
      guidance: 7.5,
      seed: 0,
      scheduler: 'euler',
      output_format: 'jpeg',
      response_format: 'b64',
    }),
  };

  try {
    const res = await fetch(url, options);
    const json = await res.json();
    if (res.ok && json.image) {
      console.log(`Image fetched successfully for prompt: ${prompt}`);

      // Create cache directory if it doesn't exist
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      // Save image to cache
      fs.writeFileSync(cacheFilePath, json.image, { encoding: 'base64' });

      return `data:image/jpeg;base64,${json.image}`;
    } else {
      console.error('Error fetching image from getimg.ai:', json.error ? json.error.message : 'Unknown error');
      return null;
    }
  } catch (err) {
    console.error('Error:', err);
    return null;
  } finally {
    // Cycle to the next API key for the next request
    apiKeyIndex = (apiKeyIndex + 1) % getImgAPIKeys.length;
  }
};

const fetchRecipes = async (ingredients) => {
  const prompt = `Ingredients list: ${ingredients.join(', ')}\nGenerate recipes based on these ingredients in the following JSON format: { "recipes": [{"name": "recipe name", "description": "recipe description", "type": "type of recipe", "cuisine": ["cuisine types"], "missing_ingredients_major": ["missing ingredients"], "allergen_type": ["allergens"], "dietary_type": ["dietary types"], "cooking_level": "cooking level", "instruction": ["instructions"]}]}`;

  try {
    const result = await model.generateContent(prompt, generationConfig);
    const response = await result.response;
    let text = await response.text();
    console.log(`Raw response text: ${text}`);

    // Remove backticks and any JSON-specific formatting errors
    text = text.replace(/```json|```/g, '').trim();

    return text;
  } catch (error) {
    console.error('Error fetching recipes from Google Generative AI:', error);
    return null;
  }
};

router.post('/generate-recipes', async (req, res) => {
  console.log('Received request:', req.body);
  const ingredients = req.body.ingredients;
  const recipesResponse = await fetchRecipes(ingredients);
  if (!recipesResponse) {
    console.error('Error fetching recipes');
    return res.status(500).send('Error fetching recipes');
  }

  try {
    console.log(`Recipes response before parsing: ${recipesResponse}`);
    const recipesData = JSON.parse(recipesResponse);
    const recipes = recipesData.recipes;
    const recipesWithImages = [];

    for (const recipe of recipes) {
      const imageBase64 = await fetchImageFromGetImgAI(`Image of ${recipe.name}`);
      if (imageBase64) {
        recipe.image = imageBase64;
      }
      recipesWithImages.push(recipe);
    }

    console.log('Sending response with recipes:', recipesWithImages);
    res.json({ recipes: recipesWithImages });
  } catch (error) {
    console.error('Error parsing recipes response:', error);
    return res.status(500).send('Error parsing recipes response');
  }
});

export default router;
