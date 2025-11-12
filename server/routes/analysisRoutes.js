const express = require('express');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

router.get('/analyze-tweets', analysisController.analyzeTweets);
router.get('/prompt-context', analysisController.getPromptContext);

module.exports = router;
