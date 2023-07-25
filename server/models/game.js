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
			unique: true,
			default: null,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Game', gameSchema);
