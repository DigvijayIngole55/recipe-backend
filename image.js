import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const baseUrl = 'https://platform.fatsecret.com/rest/server.api';
const consumerKey = '64602404b3914509a856dbfa1a405170';
const consumerSecret = 'ae7f04ac9172426bbe73e211c30e05e2';

function generateSignature(baseString, key) {
  const hmac = crypto.createHmac('sha1', key);
  const digest = hmac.update(baseString).digest('base64');
  return digest;
}

function generateBaseString(method, url, params) {
  const sortedParams = Object.keys(params).sort().map(key => {
    return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
  }).join('&');
  return `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
}

router.get('/fetch-image', async (req, res) => {
  const query = req.query.query || 'chicken fried rice';
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const params = {
    method: 'foods.search',
    search_expression: query,
    format: 'json',
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0'
  };

  const baseString = generateBaseString('GET', baseUrl, params);
  const signingKey = `${consumerSecret}&`;
  const signature = generateSignature(baseString, signingKey);
  params.oauth_signature = signature;

  const url = `${baseUrl}?${new URLSearchParams(params).toString()}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.foods && data.foods.food && data.foods.food.length > 0) {
      const food = data.foods.food[0];
      const imageUrl = food.food_url; // Adjust this if there's a specific image field
      res.json({ imageUrl });
    } else {
      res.status(404).json({ message: 'No image found for the query.' });
    }
  } catch (error) {
    console.error('Error fetching image from FatSecret API:', error);
    res.status(500).json({ message: 'Error fetching image from FatSecret API.', error: error.toString() });
  }
});

export default router;
