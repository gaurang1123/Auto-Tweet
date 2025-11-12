const express = require('express');
const promptController = require('../controllers/promptController');

const router = express.Router();

router.post('/generate-enhanced', promptController.generateEnhancedContent);
router.post('/rewrite-enhanced', promptController.rewriteWithContext);
router.get('/usage-stats', promptController.getUsageStats);

module.exports = router;
