import express from 'express';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

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

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fetchRecipes = async (ingredients) => {
  const prompt = `Ingredients list: ${ingredients.join(', ')}\nGenerate recipes based on these ingredients in the following JSON format: { "recipes": [{"name": "recipe name", "description": "recipe description", "type": "type of recipe", "cuisine": ["cuisine types"], "missing_ingredients_major": ["missing ingredients"], "allergen_type": ["allergens"], "dietary_type": ["dietary types"], "cooking_level": "cooking level", "instruction": ["instructions"]}]}`;

  try {
    const result = await model.generateContent(prompt, generationConfig);
    const response = await result.response;
    let text = await response.text();
    console.log(`Raw response text: ${text}`);

    // Remove backticks and any JSON-specific formatting errors
    text = text.replace(/```json|```/g, '').trim();

    return JSON.parse(text).recipes;
  } catch (error) {
    console.error('Error fetching recipes from Google Generative AI:', error);
    return [];
  }
};

const fetchImageFromGetImgAI = async (prompt) => {
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
      width: 512,
      height: 512,
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
      return `data:image/jpeg;base64,${json.image}`; // Return base64-encoded image with proper prefix
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

// Route to generate recipes
router.post('/generate-recipes', async (req, res) => {
  const { ingredients } = req.body;
  try {
    const recipes = await fetchRecipes(ingredients);
    res.status(200).json({ recipes });
  } catch (error) {
    console.error('Error in /generate-recipes:', error);
    res.status(500).json({ error: 'Failed to generate recipes' });
  }
});

// Route to fetch images for recipes
router.post('/fetch-images', async (req, res) => {
  const { recipes } = req.body;
  const recipesWithImages = [];

  try {
    for (const recipe of recipes) {
      const image = await fetchImageFromGetImgAI(`Image of ${recipe.name}`);
      if (image) {
        try {
          const result = await cloudinary.uploader.upload(image, {
            folder: 'recipes',
            public_id: recipe.name,
          });
          recipe.image = result.secure_url;
          console.log(`Image uploaded successfully for recipe ${recipe.name}: ${result.secure_url}`);
        } catch (uploadError) {
          console.error(`Error uploading image for ${recipe.name}:`, uploadError);
          recipe.image = '';
        }
      }
      recipesWithImages.push(recipe);
    }
    res.status(200).json({ recipes: recipesWithImages });
  } catch (error) {
    console.error('Error in /fetch-images:', error);
    res.status(500).json({ error: 'Failed to fetch images for recipes' });
  }
});

export { fetchRecipes, fetchImageFromGetImgAI };
export default router;
