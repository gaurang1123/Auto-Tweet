const mongoose = require('mongoose');

const scheduledPostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  context: { type: String },
  selectedPostIds: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  scheduledFor: { type: Date },
  isPosted: { type: Boolean, default: false },
  postedAt: { type: Date }
});

const ScheduledPost = mongoose.model('ScheduledPost', scheduledPostSchema);

module.exports = { ScheduledPost };
