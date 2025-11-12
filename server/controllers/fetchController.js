const { TwitterApi } = require('twitter-api-v2');
const { User } = require('../models/User');
const { Tweet } = require('../models/Tweet');

const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const fetchController = {
  // Fetch posts using start_time parameter and save to database
  fetchAllPosts: async (req, res) => {
    try {
      const users = await User.find();
      const results = [];
      const errors = [];
      let totalTweetsFetched = 0;
      let totalTweetsSaved = 0;
      
      for (const user of users) {
        try {
          // Get user info
          const userInfo = await client.v2.userByUsername(user.username);
          if (!userInfo.data) {
            errors.push(`User @${user.username} not found`);
            continue;
          }
          
          // Build query parameters
          const queryParams = {
            exclude: ['retweets', 'replies'],
            'tweet.fields': ['created_at', 'public_metrics', 'text']
          };
          
          // If user has been fetched before, use start_time to get posts after last timestamp
          if (user.lastPostTimestamp) {
            queryParams.start_time = user.lastPostTimestamp.toISOString();
            queryParams.max_results = 100; // Get all new posts
          } else {
            // First fetch - only get 2 most recent posts
            queryParams.max_results = 2;
          }
          
          const tweets = await client.v2.userTimeline(userInfo.data.id, queryParams);
          
          const formattedTweets = tweets.data?.data?.map(tweet => ({
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            metrics: tweet.public_metrics,
            author: user.username,
            tag: user.tag
          })) || [];
          
          // Save tweets to database
          let savedCount = 0;
          for (const tweet of formattedTweets) {
            try {
              await Tweet.create({
                tweetId: tweet.id,
                text: tweet.text,
                author: tweet.author,
                tag: tweet.tag,
                created_at: new Date(tweet.created_at),
                metrics: tweet.metrics,
                isUsed: false
              });
              savedCount++;
            } catch (error) {
              // Skip if tweet already exists (duplicate key error)
              if (error.code !== 11000) {
                console.error('Error saving tweet:', error);
              }
            }
          }
          
          // Update user's last post timestamp
          if (formattedTweets.length > 0) {
            // Get the most recent tweet timestamp (first in the array)
            const latestTimestamp = new Date(formattedTweets[0].created_at);
            await User.findByIdAndUpdate(user._id, {
              lastPostTimestamp: latestTimestamp
            });
          }
          
          totalTweetsFetched += formattedTweets.length;
          totalTweetsSaved += savedCount;
          
          results.push({
            username: user.username,
            tag: user.tag,
            status: 'success',
            newTweets: formattedTweets.length,
            savedTweets: savedCount,
            tweets: formattedTweets,
            fetchType: user.lastPostTimestamp ? 'incremental' : 'initial',
            lastTimestamp: user.lastPostTimestamp ? user.lastPostTimestamp.toISOString() : null
          });
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          errors.push(`Error fetching @${user.username}: ${error.message}`);
          results.push({
            username: user.username,
            tag: user.tag,
            status: 'error',
            message: error.message,
            tweets: [],
            newTweets: 0,
            savedTweets: 0
          });
        }
      }
      
      res.json({
        success: true,
        totalUsers: users.length,
        totalNewTweets: totalTweetsFetched,
        totalSavedTweets: totalTweetsSaved,
        results,
        errors
      });
      
    } catch (error) {
      console.error('Error in fetchAllPosts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  },

  // Daily cleanup - delete used tweets older than 1 day
  dailyCleanup: async (req, res) => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await Tweet.deleteMany({
        isUsed: true,
        fetchedAt: { $lt: oneDayAgo }
      });
      
      res.json({
        success: true,
        deletedCount: result.deletedCount,
        message: `Cleaned up ${result.deletedCount} used tweets older than 24 hours`
      });
    } catch (error) {
      console.error('Error in dailyCleanup:', error);
      res.status(500).json({ error: 'Failed to cleanup tweets' });
    }
  },

  // Get fetch status for all users
  getFetchStatus: async (req, res) => {
    try {
      const users = await User.find();
      const totalTweets = await Tweet.countDocuments();
      const usedTweets = await Tweet.countDocuments({ isUsed: true });
      const unusedTweets = await Tweet.countDocuments({ isUsed: false });
      
      const status = users.map(user => ({
        username: user.username,
        tag: user.tag,
        hasTimestamp: !!user.lastPostTimestamp,
        lastPostTime: user.lastPostTimestamp ? user.lastPostTimestamp.toISOString() : null
      }));
      
      res.json({ 
        status,
        database: {
          totalTweets,
          usedTweets,
          unusedTweets,
          cleanupNeeded: usedTweets > 0
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get fetch status' });
    }
  }
};

module.exports = fetchController;
