const { Tweet } = require('../models/Tweet');
const { extractTweetData } = require('./analysisController');

const manualPostController = {
  // Add manual post
  addManualPost: async (req, res) => {
    try {
      const { text, author, tag } = req.body;

      if (!text || !author || !tag) {
        return res.status(400).json({ error: 'Text, author, and tag are required' });
      }

      // Generate a unique ID for manual posts
      const manualTweetId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const tweet = new Tweet({
        tweetId: manualTweetId,
        text: text.trim(),
        author: author.replace('@', ''),
        tag,
        created_at: new Date(),
        metrics: {
          like_count: 0,
          retweet_count: 0,
          reply_count: 0
        },
        isUsed: false
      });

      await tweet.save();
      
      res.json({ 
        success: true, 
        tweet,
        message: 'Manual post added successfully'
      });
    } catch (error) {
      console.error('Error adding manual post:', error);
      res.status(500).json({ error: 'Failed to add manual post' });
    }
  },

  // Get manual posts
  getManualPosts: async (req, res) => {
    try {
      const manualPosts = await Tweet.find({ 
        tweetId: { $regex: '^manual_' }
      }).sort({ created_at: -1 });

      res.json({
        success: true,
        posts: manualPosts
      });
    } catch (error) {
      console.error('Error fetching manual posts:', error);
      res.status(500).json({ error: 'Failed to fetch manual posts' });
    }
  }
};

module.exports = manualPostController;
