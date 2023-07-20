const mongoose = require('mongoose');

const matchSchema = mongoose.Schema({
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
	code: {
		type: String,
		required: true,
		unique: true,
		minlength: 6,
		maxlength: 6,
	},
});

module.exports = mongoose.model('Match', matchSchema);
