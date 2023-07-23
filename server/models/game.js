const mongoose = require('mongoose');

const gameSchema = mongoose.Schema(
	{
		player: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		opponent: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},
		winner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},
		status: {
			type: String,
			enum: ['WAITING', 'PLAYING', 'DONE'],
			default: 'WAITING',
		},
		fen: {
			type: String,
			default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Game', gameSchema);
