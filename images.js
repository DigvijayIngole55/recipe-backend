import express from 'express';
import cloudinary from 'cloudinary';
import { fetchImageFromGetImgAI } from './recipes.js';

const router = express.Router();

router.post('/fetch-images', async (req, res) => {
  const { recipes } = req.body;
  const recipesWithImages = [];

  for (const recipe of recipes) {
    try {
      const image = await fetchImageFromGetImgAI(`Image of ${recipe.name}`);
      if (image) {
        const result = await cloudinary.v2.uploader.upload(image, {
          folder: 'recipes',
          public_id: recipe.name,
        });
        recipe.image = result.secure_url;
      }
    } catch (error) {
      console.error(`Error fetching or uploading image for recipe ${recipe.name}:`, error);
      recipe.image = null; // Set to null if there's an error
    }
    recipesWithImages.push(recipe);
  }

  res.status(200).json({ recipes: recipesWithImages });
});

export default router;
