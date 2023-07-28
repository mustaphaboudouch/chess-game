const User = require('../models/user');
const Game = require('../models/game');

/**
 * Get all users
 */
async function getAll(req, res) {
	try {
		const users = await User.findAll({
			where: {
				role: 'PLAYER',
			},
		});

		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Get all users
 */
async function getById(req, res) {
	try {
		const user = await User.findByPk(req.params.id);

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
 * Remove a specific user
 */
async function remove(req, res) {
	try {
		const user = await User.findByPk(req.params.id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		await user.destroy();

		const users = await User.findAll({
			where: {
				role: 'PLAYER',
			},
		});

		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

module.exports = {
	getAll,
	getById,
	remove,
};
