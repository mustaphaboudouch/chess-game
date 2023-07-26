const mongoose = require('mongoose');

const gameSchema = mongoose.Schema(
	{
		playerId: {
			type: Number,
			required: true,
		},
		opponentId: {
			type: Number,
			default: null,
		},
		winnerId: {
			type: Number,
			default: null,
		},
		status: {
			type: String,
			enum: ['WAITING', 'PLAYING', 'DONE', 'CANCELED'],
			default: 'WAITING',
		},
		visibility: {
			type: String,
			enum: ['PUBLIC', 'PRIVATE'],
			default: 'PUBLIC',
		},
		fen: {
			type: String,
			default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		},
		code: {
			type: String,
			minlength: 6,
			maxlength: 6,
			default: null,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Game', gameSchema);
