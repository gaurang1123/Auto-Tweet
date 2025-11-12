const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  tag: { type: String, enum: ['influencer', 'company'], required: true },
  addedAt: { type: Date, default: Date.now },
  lastPostTimestamp: { type: Date, default: null },
  lastFetchTime: { type: Date, default: null }
});

const postedTweetSchema = new mongoose.Schema({
  originalTweetId: String,
  originalAuthor: String,
  rewrittenContent: String,
  postedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('MonitoredUser', userSchema);
const PostedTweet = mongoose.model('PostedTweet', postedTweetSchema);

module.exports = { User, PostedTweet };
