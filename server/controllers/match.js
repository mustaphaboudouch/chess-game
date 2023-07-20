const User = require('../models/user');
const Match = require('../models/match');
const { generateCode } = require('../lib/utils');

/**
 * Create new match
 */
async function create(req, res) {
	try {
		const match = await Match.create({
			player: res.locals.user.userId,
			status: 'WAITING',
			code: generateCode(6),
		});

		res.status(201).json({ match });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Join an existing match
 */
async function join(req, res) {
	try {
		const match = await Match.findOne({
			status: 'WAITING',
			code: req.body.code,
		});

		if (!match) {
			return res.status(404).json({ message: 'Match not found' });
		}

		await Match.findByIdAndUpdate(match.id, {
			opponent: res.locals.user.userId,
			status: 'PLAYING',
		});

		res.status(200).json({ match });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

module.exports = {
	create,
	join,
};
