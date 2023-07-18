const User = require('../models/user');

/**
 * Check if user is ADMIN
 */
async function isAdmin(req, res, next) {
	const user = await User.findById(res.locals.user.userId);

	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	if (user.role !== 'ADMIN') {
		return res.status(401).json({ message: 'Not admin' });
	}

	next();
}

module.exports = isAdmin;
