const { Sequelize } = require('sequelize');
const pg = require('pg');

const sequelize = new Sequelize(process.env.POSTGRES_DATABASE_URI, {
	dialect: 'postgres',
	dialectModule: pg,
});

module.exports = sequelize;
