const express = require('express');
const scheduledPostController = require('../controllers/scheduledPostController');

const router = express.Router();

router.get('/', scheduledPostController.getAllScheduledPosts);
router.post('/', scheduledPostController.createScheduledPost);
router.put('/:id', scheduledPostController.updateScheduledPost);
router.delete('/:id', scheduledPostController.deleteScheduledPost);
router.get('/ready-to-post', scheduledPostController.getPostsToPost);

module.exports = router;
