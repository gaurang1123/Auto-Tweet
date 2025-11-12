require('dotenv').config();
const TwitterPoster = require('./twitter-poster');

async function postTweet(content) {
  const poster = new TwitterPoster(
    process.env.TWITTER_USERNAME,
    process.env.TWITTER_PASSWORD
  );
  
  try {
    await poster.login();
    await poster.postTweet(content);
    console.log('Tweet posted:', content);
  } finally {
    await poster.close();
  }
}

// Usage
const tweetContent = process.argv[2] || "Hello from Node.js automation!";
postTweet(tweetContent);
