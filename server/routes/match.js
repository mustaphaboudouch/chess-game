const express = require('express');
const { create, join } = require('../controllers/match');
const { isAuthenticated } = require('../middlewares');

const router = express.Router();

router.post('/matchs', isAuthenticated, create);
router.post('/matchs/join', isAuthenticated, join);

module.exports = router;
