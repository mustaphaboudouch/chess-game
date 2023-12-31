const bcrypt = require('bcrypt');
const User = require('../models/user');
const Game = require('../models/game');
const { buildToken } = require('../lib/token');

/**
 * Sign up a new user
 */
async function signUp(req, res) {
	try {
		const user = await User.create({
			username: req.body.username,
			email: req.body.email,
			password: bcrypt.hashSync(req.body.password, 10),
			role: 'PLAYER',
			score: 100,
		});

		const token = buildToken(user);
		res.status(201).json({ token });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Sign in an existing user
 */
async function signIn(req, res) {
	try {
		const user = await User.findOne({ where: { email: req.body.email } });

		const passwordMatch = await bcrypt.compare(
			req.body.password,
			user.password,
		);

		if (!user || !passwordMatch) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const token = buildToken(user);
		res.status(200).json({ token });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Get logged user
 */
async function me(req, res) {
	try {
		const user = await User.findByPk(res.locals.user.id, {
			attributes: { exclude: ['password'] },
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const gamesCount = await Game.countDocuments({
			$or: [{ playerId: user.id }, { opponentId: user.id }],
		});

		res.status(200).json({
			...user.toJSON(),
			gamesCount,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Update user profile (username)
 */
async function updateProfile(req, res) {
	try {
		const user = await User.findByPk(res.locals.user.id, {
			attributes: { exclude: ['password'] },
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		user.set({ username: req.body.username });
		await user.save();

		const gamesCount = await Game.countDocuments({
			$or: [{ playerId: user.id }, { opponentId: user.id }],
		});

		res.status(201).json({
			...user.toJSON(),
			gamesCount,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

module.exports = {
	signUp,
	signIn,
	me,
	updateProfile,
};
