import express from 'express';
import cloudinary from 'cloudinary';
import { fetchImageFromGetImgAI } from './recipes.js';

const router = express.Router();

router.post('/fetch-images', async (req, res) => {
  const { recipes } = req.body;
  const recipesWithImages = [];

  for (const recipe of recipes) {
    const image = await fetchImageFromGetImgAI(`Image of ${recipe.name}`);
    if (image) {
      const result = await cloudinary.v2.uploader.upload(image, {
        folder: 'recipes',
        public_id: recipe.name,
      });
      recipe.image = result.secure_url;
    }
    recipesWithImages.push(recipe);
  }

  res.status(200).json({ recipes: recipesWithImages });
});

export default router;
