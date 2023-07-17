const express = require('express');
const { signUp, signIn, me } = require('../controllers/auth');
const { isAuthenticated } = require('../middlewares');

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.get('/me', isAuthenticated, me);

module.exports = router;
