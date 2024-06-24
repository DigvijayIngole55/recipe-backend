const express = require('express');
const router = express.Router();

router.post('/get-recipes', async (req, res) => {
    const ingredients = req.body.ingredients;
    if (!ingredients || !ingredients.length) {
        return res.status(400).send({ message: 'No ingredients provided.' });
    }

    // Process ingredients (if needed)
    const processedIngredients = ingredients.map(ingredient => {
        return {
            name: ingredient,
            processed: true
        };
    });

    // Mock response for recipe data
    const recipes = [
        {
            name: 'Spaghetti Bolognese',
            type: 'Main Course',
            missingIngredients: [],
            image: 'https://www.jamieoliver.com/recipes/beef-recipes/spaghetti-bolognese/olivers-twist/'
        },
        {
            name: 'Chicken Curry',
            type: 'Main Course',
            missingIngredients: ['Coconut Milk'],
            image: 'https://example.com/chicken-curry.jpg'
        },
        {
            name: 'Vegetable Stir Fry',
            type: 'Main Course',
            missingIngredients: ['Soy Sauce'],
            image: 'https://example.com/vegetable-stir-fry.jpg'
        },
        {
            name: 'Chocolate Cake',
            type: 'Dessert',
            missingIngredients: ['Cocoa Powder'],
            image: 'https://example.com/chocolate-cake.jpg'
        },
        {
            name: 'Caesar Salad',
            type: 'Salad',
            missingIngredients: ['Parmesan Cheese'],
            image: 'https://example.com/caesar-salad.jpg'
        },
        {
            name: 'Pancakes',
            type: 'Breakfast',
            missingIngredients: [],
            image: 'https://example.com/pancakes.jpg'
        },
        {
            name: 'Beef Tacos',
            type: 'Main Course',
            missingIngredients: ['Taco Shells'],
            image: 'https://example.com/beef-tacos.jpg'
        },
        {
            name: 'Mango Smoothie',
            type: 'Beverage',
            missingIngredients: [],
            image: 'https://example.com/mango-smoothie.jpg'
        }
    ];

    res.send({ recipes, processedIngredients });
});

module.exports = router;
