const express = require('express');
const cors = require('cors');
require('dotenv').config();
const logger = require('./logger');

const app = express();
const port = process.env.PORT || 5000;

// In-memory store for API keys (Not persistent)
let apiKeys = {
  twitter: {},
  gemini: ''
};

app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// Endpoint to get current keys
app.get('/api/keys', (req, res) => {
  res.json(apiKeys);
});

// Endpoint to update keys
app.post('/api/keys', (req, res) => {
  const { twitter, gemini } = req.body;
  if (twitter) {
    apiKeys.twitter = twitter;
  }
  if (gemini) {
    apiKeys.gemini = gemini;
  }
  logger.info('Updated API Keys:', { apiKeys });
  res.status(200).json({ message: 'API keys updated successfully.' });
});

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Endpoint for tweet generation
app.post('/api/tweet', async (req, res) => {
  const { niche, subCategory, userInfo } = req.body;

  if (!apiKeys.gemini) {
    return res.status(400).json({ message: 'Gemini API key not set.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKeys.gemini);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Create a tweet about ${niche} - specifically ${subCategory}. User-provided info: "${userInfo}". Keep it concise and engaging.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tweet = response.text();

    res.json({ tweet });
  } catch (error) {
    console.error('Error generating tweet:', error);
    res.status(500).json({ message: 'Error generating tweet.' });
  }
});

const { TwitterApi } = require('twitter-api-v2');

app.post('/api/post-tweet', async (req, res) => {
  const { tweet } = req.body;

  if (!apiKeys.twitter.appKey || !apiKeys.twitter.appSecret || !apiKeys.twitter.accessToken || !apiKeys.twitter.accessSecret) {
    return res.status(400).json({ message: 'Twitter API keys not set.' });
  }

  try {
    const client = new TwitterApi({
      appKey: apiKeys.twitter.appKey,
      appSecret: apiKeys.twitter.appSecret,
      accessToken: apiKeys.twitter.accessToken,
      accessSecret: apiKeys.twitter.accessSecret,
    });

    await client.v2.tweet(tweet);
    res.status(200).json({ message: 'Tweet posted successfully.' });
  } catch (error) {
    console.error('Error posting tweet:', error);
    res.status(500).json({ message: 'Error posting tweet.' });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
