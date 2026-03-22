const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getRatesHandler } = require('../controllers/ratesController');

router.get('/', auth, getRatesHandler);

module.exports = router;
