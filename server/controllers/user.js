const User = require('../models/user');

/**
 * Get all users
 */
async function getAll(req, res) {
	try {
		const users = await User.find({
			role: 'PLAYER',
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
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Remove a specific user
 */
async function remove(req, res) {
	try {
		await User.findByIdAndDelete(req.params.id);

		const users = await User.find({
			role: 'PLAYER',
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
