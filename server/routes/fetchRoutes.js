const express = require('express');
const fetchController = require('../controllers/fetchController');

const router = express.Router();

router.get('/fetch-all-posts', fetchController.fetchAllPosts);
router.get('/fetch-status', fetchController.getFetchStatus);
router.post('/daily-cleanup', fetchController.dailyCleanup);

module.exports = router;
