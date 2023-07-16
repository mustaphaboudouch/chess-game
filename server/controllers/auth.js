const jwt = require('jsonwebtoken');
const User = require('../models/user');

function buildToken(user) {
	const payload = { userId: user.id };
	return jwt.sign(payload, process.env.TOKEN_SECRET_KEY, {
		expiresIn: +process.env.TOKEN_EXPIRATION,
	});
}

function setToken(res, token) {
	res.cookie(process.env.TOKEN_COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
		domain: 'localhost',
		path: '/',
		maxAge: +process.env.TOKEN_EXPIRATION * 1000,
	});
}

function clearToken(res) {
	res.cookie(process.env.TOKEN_COOKIE_NAME, '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
		domain: 'localhost',
		path: '/',
		maxAge: 0,
	});
}

/**
 * Register a new user
 */
async function register(req, res) {
	try {
		const user = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			role: 'PLAYER',
			score: 0,
		});

		const token = buildToken(user);
		setToken(res, token);

		res.status(201).end();
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Log in an existing user
 */
async function login(req, res) {
	try {
		const user = await User.findOne({ email: req.body.email }).select(
			'+password',
		);

		if (!user || user.password !== req.body.password) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const token = buildToken(user);
		setToken(res, token);

		res.status(200).end();
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Log out logged user
 */
function logout(req, res) {
	try {
		clearToken(res);
		res.status(200).end();
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

module.exports = {
	register,
	login,
	logout,
};
