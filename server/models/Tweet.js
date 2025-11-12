const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  tweetId: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  author: { type: String, required: true },
  tag: { type: String, enum: ['influencer', 'company'], required: true },
  created_at: { type: Date, required: true },
  metrics: {
    like_count: Number,
    retweet_count: Number,
    reply_count: Number
  },
  fetchedAt: { type: Date, default: Date.now },
  isUsed: { type: Boolean, default: false }
});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = { Tweet };
