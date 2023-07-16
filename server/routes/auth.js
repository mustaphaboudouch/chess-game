const express = require('express');
const { signUp, signIn, signOut, me } = require('../controllers/auth');
const { isAuthenticated } = require('../middlewares');

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/sign-out', signOut);
router.get('/me', isAuthenticated, me);

module.exports = router;
