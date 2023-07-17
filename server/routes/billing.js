const express = require('express');
const { subscribe } = require('../controllers/billing');
const { isAuthenticated } = require('../middlewares');

const router = express.Router();

router.get('/subscribe', isAuthenticated, subscribe);

module.exports = router;
