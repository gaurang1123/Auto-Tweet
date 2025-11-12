const { ScheduledPost } = require('../models/ScheduledPost');

const scheduledPostController = {
  // Get all scheduled posts
  getAllScheduledPosts: async (req, res) => {
    try {
      const posts = await ScheduledPost.find().sort({ createdAt: -1 });
      res.json({ success: true, posts });
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      res.status(500).json({ error: 'Failed to fetch scheduled posts' });
    }
  },

  // Create new scheduled post
  createScheduledPost: async (req, res) => {
    try {
      const { content, context, selectedPostIds, scheduledFor } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const scheduledPost = new ScheduledPost({
        content: content.trim(),
        context,
        selectedPostIds,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null
      });

      await scheduledPost.save();
      
      res.json({ 
        success: true, 
        post: scheduledPost,
        message: 'Post scheduled successfully'
      });
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      res.status(500).json({ error: 'Failed to create scheduled post' });
    }
  },

  // Update scheduled post
  updateScheduledPost: async (req, res) => {
    try {
      const { id } = req.params;
      const { content, scheduledFor, isPosted } = req.body;

      const post = await ScheduledPost.findByIdAndUpdate(
        id,
        { 
          content: content?.trim(),
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          isPosted,
          postedAt: isPosted ? new Date() : undefined
        },
        { new: true }
      );

      if (!post) {
        return res.status(404).json({ error: 'Scheduled post not found' });
      }

      res.json({ success: true, post });
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      res.status(500).json({ error: 'Failed to update scheduled post' });
    }
  },

  // Delete scheduled post
  deleteScheduledPost: async (req, res) => {
    try {
      const { id } = req.params;

      const post = await ScheduledPost.findByIdAndDelete(id);

      if (!post) {
        return res.status(404).json({ error: 'Scheduled post not found' });
      }

      res.json({ success: true, message: 'Scheduled post deleted' });
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      res.status(500).json({ error: 'Failed to delete scheduled post' });
    }
  },

  // Get posts ready to be posted
  getPostsToPost: async (req, res) => {
    try {
      const now = new Date();
      const posts = await ScheduledPost.find({
        isPosted: false,
        scheduledFor: { $lte: now }
      }).sort({ scheduledFor: 1 });

      res.json({ success: true, posts });
    } catch (error) {
      console.error('Error fetching posts to post:', error);
      res.status(500).json({ error: 'Failed to fetch posts to post' });
    }
  }
};

module.exports = scheduledPostController;
