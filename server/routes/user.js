const express = require('express');
const { getById, getAll, remove } = require('../controllers/user');
const { isAuthenticated, isAdmin } = require('../middlewares');

const router = express.Router();

router.get('/users', isAuthenticated, isAdmin, getAll);
router.get('/users/:id', isAuthenticated, isAdmin, getById);
router.delete('/users/:id', isAuthenticated, isAdmin, remove);

module.exports = router;
