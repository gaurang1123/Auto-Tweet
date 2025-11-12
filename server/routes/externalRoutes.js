const express = require('express');
const externalDataController = require('../controllers/externalDataController');

const router = express.Router();

router.get('/external-context', externalDataController.getExternalContext);
router.get('/combined-context', externalDataController.getCombinedContext);

module.exports = router;
