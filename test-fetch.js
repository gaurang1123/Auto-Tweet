const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function fetchTweets(username) {
  try {
    // Get user by username
    const user = await client.v2.userByUsername(username);
    console.log('User found:', user.data);
    
    // Get user's tweets
    const tweets = await client.v2.userTimeline(user.data.id, {
      max_results: 5,
      exclude: ['retweets', 'replies'],
      'tweet.fields': ['created_at', 'public_metrics', 'text']
    });
    
    console.log('\nLatest tweets:');
    tweets.data?.data?.forEach((tweet, i) => {
      console.log(`${i+1}. ${tweet.text}`);
      console.log(`   Created: ${tweet.created_at}`);
      console.log(`   Likes: ${tweet.public_metrics.like_count}\n`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchTweets('cryptowithkhan');
