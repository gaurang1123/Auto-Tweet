const express = require('express');
const manualPostController = require('../controllers/manualPostController');

const router = express.Router();

router.post('/', manualPostController.addManualPost);
router.get('/', manualPostController.getManualPosts);

module.exports = router;
