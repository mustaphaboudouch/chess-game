const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	username: {
		type: String,
		required: [true, 'Username is required'],
		unique: [true, 'Username must be unique'],
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: [true, 'Email must be unique'],
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		minlength: [8, 'Password must be at least 8 characters long'],
		select: false,
	},
	role: {
		type: String,
		enum: {
			values: ['ADMIN', 'PLAYER'],
			message: 'Invalid role',
		},
	},
	score: {
		type: Number,
		min: [0, 'Score must be greater than or equal to 0'],
		default: 0,
	},
});

module.exports = mongoose.model('User', userSchema);
