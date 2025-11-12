const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

console.log('Testing Twitter API credentials...');
console.log('API Key exists:', !!process.env.TWITTER_APP_KEY);
console.log('API Secret exists:', !!process.env.TWITTER_APP_SECRET);

const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function testAPI() {
  try {
    // Test with a simple API call first
    const me = await client.v2.me();
    console.log('API working! Authenticated as:', me.data.username);
    
    // Now try to fetch tweets
    const user = await client.v2.userByUsername('cryptowithkhan');
    console.log('Target user found:', user.data.username);
    
  } catch (error) {
    console.error('API Error:', error.code, error.message);
    if (error.data) console.error('Details:', error.data);
  }
}

testAPI();
