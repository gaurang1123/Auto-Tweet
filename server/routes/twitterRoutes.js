const express = require('express');
const twitterController = require('../controllers/twitterController');

const router = express.Router();

router.get('/fetch-tweets/:username', twitterController.fetchTweets);

module.exports = router;
