const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Tweet } = require('../models/Tweet');
const axios = require('axios');

const promptController = {
  // Enhanced content generation with unlimited context
  generateEnhancedContent: async (req, res) => {
    try {
      const { niche, subCategory, userInfo, useContext = true } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: 'Gemini API key not configured' });
      }

      let contextData = '';
      
      // Get combined context (internal tweets + external market data)
      if (useContext) {
        try {
          const contextResponse = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/combined-context?niche=${niche}`);
          if (contextResponse.data.success) {
            contextData = contextResponse.data.combinedPrompt;
          }
        } catch (error) {
          console.error('Combined context fetch error:', error);
          return res.status(500).json({ 
            error: 'Failed to fetch context data. Please try again or disable context.',
            details: error.message 
          });
        }
      }

      // Optimized prompt - concise but effective
      const prompt = `Create a ${niche} tweet about ${subCategory}.

Requirements:
- Under 280 characters
- Engaging and informative
- Include 2-3 relevant hashtags
- Professional tone
${userInfo ? `- User context: ${userInfo}` : ''}
${contextData}

Generate only the tweet text, no explanations.`;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash'
      });

      const result = await model.generateContent(prompt);
      const generatedText = result.response.text();
      
      res.json({ 
        content: generatedText.trim(),
        model: 'gemini-2.5-flash',
        contextUsed: useContext && contextData.length > 0
      });

    } catch (error) {
      console.error('Enhanced generation error:', error);
      res.status(500).json({ 
        error: 'Content generation failed. Please check your API key and try again.',
        details: error.message 
      });
    }
  },

  // Enhanced rewrite with unlimited context
  rewriteWithContext: async (req, res) => {
    try {
      const { originalText, author, tag, tweetId } = req.body;

      if (!originalText || !author) {
        return res.status(400).json({ error: 'Original text and author required' });
      }

      // Check if already processed
      const existingTweet = await Tweet.findOne({ tweetId });
      if (existingTweet?.isUsed) {
        return res.status(400).json({ error: 'Tweet already processed' });
      }

      // Optimized rewrite prompt
      const prompt = `Rewrite this ${tag} tweet in a fresh way:
"${originalText}"

Keep:
- Core message and facts
- Important dates/links
- Crypto/airdrop context

Make it:
- Natural and engaging
- Under 280 characters
- Your own voice

Output only the rewritten tweet.`;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash'
      });

      const result = await model.generateContent(prompt);
      const rewrittenText = result.response.text().trim();

      // Mark tweet as used
      if (tweetId) {
        await Tweet.findOneAndUpdate(
          { tweetId }, 
          { isUsed: true },
          { upsert: false }
        );
      }

      res.json({ 
        rewrittenText,
        model: 'gemini-2.5-flash',
        originalAuthor: author
      });

    } catch (error) {
      console.error('Rewrite error:', error);
      res.status(500).json({ 
        error: 'Rewrite failed. Please check your API key and try again.',
        details: error.message 
      });
    }
  },

  // Get usage stats
  getUsageStats: async (req, res) => {
    const unusedTweets = await Tweet.countDocuments({ isUsed: false });
    
    res.json({
      unusedTweetsAvailable: unusedTweets,
      limitsRemoved: true,
      manualFetchOnly: true
    });
  }
};

module.exports = promptController;
