const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

module.exports = sequelize.define(
	'User',
	{
		username: {
			type: DataTypes.STRING,
			validate: {
				len: [8, 32],
			},
		},
		email: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [8, 32],
				// is: /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/i,
			},
		},
		role: {
			type: DataTypes.ENUM('ADMIN', 'PLAYER'),
			allowNull: false,
			defaultValue: 'PLAYER',
		},
		score: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 100,
			validate: {
				min: 0,
			},
		},
		// stripe fields
		stripeCustomerId: {
			type: DataTypes.STRING,
			defaultValue: null,
		},
		stripeSubscriptionId: {
			type: DataTypes.STRING,
			defaultValue: null,
		},
		stripePriceId: {
			type: DataTypes.STRING,
			defaultValue: null,
		},
		stripeCurrentPeriodEnd: {
			type: DataTypes.DATE,
			defaultValue: null,
		},
	},
	{
		tableName: 'users',
		paranoid: true,
	},
);
