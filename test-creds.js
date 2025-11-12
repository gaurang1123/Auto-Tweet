const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

(async () => {
  try {
    const me = await client.v2.me();
    console.log('Authenticated as:', me.data.username);
    
    // Test fetching tweets from cryptowithkhan
    const user = await client.v2.userByUsername('cryptowithkhan');
    console.log('Target user found:', user.data.username);
    
    const tweets = await client.v2.userTimeline(user.data.id, {
      max_results: 5,
      exclude: ['retweets', 'replies'],
      'tweet.fields': ['created_at', 'public_metrics', 'text']
    });
    
    console.log('\nLatest tweets:');
    tweets.data?.data?.forEach((tweet, i) => {
      console.log(`${i+1}. ${tweet.text.substring(0, 100)}...`);
      console.log(`   Likes: ${tweet.public_metrics.like_count}\n`);
    });
    
  } catch (err) {
    console.error('Error:', err.code, err.message);
  }
})();
