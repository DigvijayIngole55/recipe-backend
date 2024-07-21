
# Recipe Backend

This repository contains the backend code for the Receipeee app, which handles fetching recipes based on provided ingredients and integrates with various APIs for image generation and AI-based recipe suggestions.

## Features

- Fetch recipes based on provided ingredients using Google Generative AI.
- Generate images for recipes using the GetImgAI API.
- Cache generated images for faster retrieval.

## Getting Started

### Prerequisites

- Node.js: [Installation Guide](https://nodejs.org/)
- npm: [Installation Guide](https://www.npmjs.com/get-npm)
- A Google Generative AI API key
- GetImgAI API keys

### Installation

1. Clone the repository:

```bash
git clone https://github.com/DigvijayIngole55/recipe-backend.git
cd recipe-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys:

```env
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
GET_IMG_API_KEY_1=your_getimg_api_key_1
GET_IMG_API_KEY_2=your_getimg_api_key_2
GET_IMG_API_KEY_3=your_getimg_api_key_3
GET_IMG_API_KEY_4=your_getimg_api_key_4
```

4. Start the server:

```bash
npm start
```

## API Endpoints

### `POST /generate-recipes`

Fetch recipes based on provided ingredients.

#### Request Body

```json
{
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"]
}
```

#### Response

```json
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Recipe Description",
      "type": "Type of Recipe",
      "cuisine": ["Cuisine Types"],
      "missingIngredients": ["Missing Ingredients"],
      "allergenType": ["Allergens"],
      "dietaryType": ["Dietary Types"],
      "cookingLevel": "Cooking Level",
      "instruction": ["Step 1", "Step 2"],
      "image": "base64_encoded_image_string"
    }
  ]
}
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
