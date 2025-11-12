const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const twitterRoutes = require('./routes/twitterRoutes');
const fetchRoutes = require('./routes/fetchRoutes');
const promptRoutes = require('./routes/promptRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const externalRoutes = require('./routes/externalRoutes');
const scheduledPostRoutes = require('./routes/scheduledPostRoutes');
const cryptoPromptRoutes = require('./routes/cryptoPromptRoutes');
const { PostedTweet } = require('./models/User');
const { Tweet } = require('./models/Tweet');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI);

// Routes
app.use('/api/users', userRoutes);
app.use('/api', twitterRoutes);
app.use('/api', fetchRoutes);
app.use('/api', promptRoutes);
app.use('/api', analysisRoutes);
app.use('/api', externalRoutes);
app.use('/api/scheduled-posts', scheduledPostRoutes);
app.use('/api/crypto', cryptoPromptRoutes);

// Auto-cleanup old data
const cleanupOldData = async () => {
  // Clean up old posted tweets (keep only last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await PostedTweet.deleteMany({ postedAt: { $lt: sevenDaysAgo } });
  
  // Clean up used tweets (keep only last 1 day)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const result = await Tweet.deleteMany({
    isUsed: true,
    fetchedAt: { $lt: oneDayAgo }
  });
  
  console.log(`Cleaned up old data: ${result.deletedCount} used tweets deleted`);
};

// Run cleanup every hour
setInterval(cleanupOldData, 60 * 60 * 1000);

// Crypto keywords focused on airdrops
const cryptoKeywords = [
  'airdrop', 'free tokens', 'claim', 'snapshot', 'distribution',
  'testnet', 'mainnet', 'retroactive', 'eligible', 'whitelist',
  'bitcoin', 'ethereum', 'defi', 'nft', 'web3', 'dao'
];

const isCryptoPost = (text) => {
  return cryptoKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
};

// Generate content endpoint
app.post('/api/generate-content', async (req, res) => {
  const { niche, subCategory, userInfo } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(400).json({ message: 'Gemini API key not configured. Please add valid GEMINI_API_KEY to .env file.' });
  }

  const prompt = `Create a ${niche} tweet about ${subCategory}. ${userInfo ? `User context: ${userInfo}` : ''} Make it engaging, informative, and under 280 characters. Include relevant hashtags.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_PRO_MODEL || 'gemini-2.5-pro' });

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();
    
    res.json({ 
      content: generatedText,
      model: 'gemini-2.5-pro'
    });
  } catch (error) {
    console.error('Error with pro model:', error);
    
    // Try flash model as fallback
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash' });
      
      const result = await model.generateContent(prompt);
      const generatedText = result.response.text();
      
      res.json({ 
        content: generatedText,
        model: 'gemini-2.5-flash'
      });
    } catch (error2) {
      console.error('Error with flash model:', error2);
      res.status(500).json({ message: 'Gemini API error. Both models failed.' });
    }
  }
});

// Rewrite content endpoint
app.post('/api/rewrite-content', async (req, res) => {
  try {
    const { originalText, author, tag } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'Gemini API key not configured. Please add valid GEMINI_API_KEY to .env file.' });
    }
    
    if (!originalText || !author) {
      return res.status(400).json({ error: 'Original text and author are required' });
    }

    // Check if it's crypto-related
    if (!isCryptoPost(originalText)) {
      return res.status(400).json({ error: 'This post is not crypto/airdrop related' });
    }

    // Check if already posted
    const existingPost = await PostedTweet.findOne({ 
      originalAuthor: author,
      originalTweetId: req.body.tweetId 
    });
    
    if (existingPost) {
      return res.status(400).json({ error: 'This tweet has already been rewritten and posted' });
    }

    const contextMap = {
      influencer: "crypto influencer sharing market insights",
      company: "crypto company making official announcements"
    };

    const prompt = `Rewrite this tweet from a ${contextMap[tag] || 'crypto enthusiast'}: "${originalText}"
    
    Requirements:
    - Keep the core message and any important details (dates, requirements, links)
    - Make it sound natural and engaging
    - Under 280 characters
    - Maintain crypto/airdrop context
    - Don't just copy - rewrite in a fresh way
    - Include relevant hashtags if appropriate`;
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_PRO_MODEL || 'gemini-2.5-pro' });
      const result = await model.generateContent(prompt);
      const rewrittenText = result.response.text();
      
      // Save to database
      const postedTweet = new PostedTweet({
        originalTweetId: req.body.tweetId,
        originalAuthor: author,
        rewrittenContent: rewrittenText
      });
      await postedTweet.save();
      
      res.json({ rewrittenText, model: 'gemini-2.5-pro' });
    } catch (error) {
      console.error('Error with pro model:', error);
      
      // Try flash model as fallback
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const rewrittenText = result.response.text();
        
        // Save to database
        const postedTweet = new PostedTweet({
          originalTweetId: req.body.tweetId,
          originalAuthor: author,
          rewrittenContent: rewrittenText
        });
        await postedTweet.save();
        
        res.json({ rewrittenText, model: 'gemini-2.5-flash' });
      } catch (error2) {
        console.error('Error with flash model:', error2);
        res.status(500).json({ error: 'Gemini API error. Both models failed.' });
      }
    }
  } catch (error) {
    console.error('Error in rewrite-content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
