const express = require('express');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const app = express();
app.use(express.json());

const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

app.get('/api/fetch-tweets/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const count = parseInt(req.query.count) || 10;
    
    const user = await client.v2.userByUsername(username);
    if (!user.data) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const tweets = await client.v2.userTimeline(user.data.id, {
      max_results: Math.min(count, 100),
      exclude: ['retweets', 'replies'],
      'tweet.fields': ['created_at', 'public_metrics', 'text']
    });
    
    const formattedTweets = tweets.data?.data?.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: tweet.public_metrics,
      author: username
    })) || [];
    
    res.json({
      user: username,
      tweets: formattedTweets,
      count: formattedTweets.length
    });
    
  } catch (error) {
    console.error('Twitter API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tweets', 
      details: error.message,
      code: error.code 
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Twitter API server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/fetch-tweets/cryptowithkhan?count=5`);
});

module.exports = app;
