const jwt = require('jsonwebtoken');
const User = require('../models/user');

function buildToken(user) {
	const payload = { userId: user.id };
	return jwt.sign(payload, process.env.TOKEN_SECRET_KEY, {
		expiresIn: +process.env.TOKEN_EXPIRATION,
	});
}

/**
 * Sign up a new user
 */
async function signUp(req, res) {
	try {
		const user = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			role: 'PLAYER',
			score: 0,
		});

		const token = buildToken(user);
		res.status(201).json({ token, user });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Sign in an existing user
 */
async function signIn(req, res) {
	try {
		const user = await User.findOne({ email: req.body.email }).select(
			'+password',
		);

		if (!user || user.password !== req.body.password) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const token = buildToken(user);
		res.status(200).json({ token, user });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Get logged user
 */
async function me(req, res) {
	try {
		const user = await User.findById(res.locals.user.userId);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

module.exports = {
	signUp,
	signIn,
	me,
};
