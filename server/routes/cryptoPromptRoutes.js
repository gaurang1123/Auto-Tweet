const express = require('express');
const { cryptoPromptController } = require('../controllers/cryptoPromptController');

const router = express.Router();

router.get('/prompt-types', cryptoPromptController.getPromptTypes);
router.post('/generate-crypto', cryptoPromptController.generateCryptoContent);

module.exports = router;
