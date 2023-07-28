const { Op } = require('sequelize');
const { formatDate } = require('../lib/date');
const sequelize = require('../lib/sequelize');
const User = require('../models/user');
const Game = require('../models/game');

/**
 * Calculate admin stats
 */
async function calculateAdminStats() {
	const stats = await Game.aggregate([
		{
			$match: {
				$or: [
					{ status: 'WAITING' },
					{ status: 'PLAYING' },
					{ status: 'DONE' },
					{ status: 'CANCELED' },
				],
			},
		},
		{
			$group: {
				_id: null,
				WAITING: {
					$sum: { $cond: [{ $eq: ['$status', 'WAITING'] }, 1, 0] },
				},
				PLAYING: {
					$sum: { $cond: [{ $eq: ['$status', 'PLAYING'] }, 1, 0] },
				},
				DONE: { $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] } },
				CANCELED: {
					$sum: { $cond: [{ $eq: ['$status', 'CANCELED'] }, 1, 0] },
				},
				PRIVATE: {
					$sum: { $cond: [{ $eq: ['$visibility', 'PRIVATE'] }, 1, 0] },
				},
				PUBLIC: {
					$sum: { $cond: [{ $eq: ['$visibility', 'PUBLIC'] }, 1, 0] },
				},
			},
		},
		{
			$project: {
				_id: 0,
				WAITING: {
					$cond: [{ $eq: ['$WAITING', null] }, 0, '$WAITING'],
				},
				PLAYING: {
					$cond: [{ $eq: ['$PLAYING', null] }, 0, '$PLAYING'],
				},
				DONE: { $cond: [{ $eq: ['$DONE', null] }, 0, '$DONE'] },
				CANCELED: {
					$cond: [{ $eq: ['$CANCELED', null] }, 0, '$CANCELED'],
				},
				PRIVATE: {
					$cond: [{ $eq: ['$PRIVATE', null] }, 0, '$PRIVATE'],
				},
				PUBLIC: {
					$cond: [{ $eq: ['$PUBLIC', null] }, 0, '$PUBLIC'],
				},
			},
		},
	]);

	return !stats.length
		? {
				WAITING: 0,
				PLAYING: 0,
				DONE: 0,
				CANCELED: 0,
				PRIVATE: 0,
				PUBLIC: 0,
		  }
		: stats[0];
}

/**
 * Calculate player stats
 */
async function calculatePlayerStats(userId) {
	const stats = await Game.aggregate([
		{
			$match: {
				$or: [
					{ status: 'WAITING' },
					{ status: 'PLAYING' },
					{ status: 'DONE' },
					{ status: 'CANCELED' },
				],
				$or: [{ playerId: userId }, { opponentId: userId }],
			},
		},
		{
			$group: {
				_id: null,
				DONE: { $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] } },
				CANCELED: {
					$sum: { $cond: [{ $eq: ['$status', 'CANCELED'] }, 1, 0] },
				},
				PRIVATE: {
					$sum: { $cond: [{ $eq: ['$visibility', 'PRIVATE'] }, 1, 0] },
				},
				PUBLIC: {
					$sum: { $cond: [{ $eq: ['$visibility', 'PUBLIC'] }, 1, 0] },
				},
				WIN: { $sum: { $cond: [{ $eq: ['$winnerId', userId] }, 1, 0] } },
				LOSE: {
					$sum: {
						$cond: [
							{
								$and: [
									{ $eq: ['$status', 'DONE'] },
									{ $ne: ['$winnerId', userId] },
									{ $ne: ['$winnerId', null] },
								],
							},
							1,
							0,
						],
					},
				},
				DRAW: {
					$sum: {
						$cond: [
							{
								$and: [
									{ $eq: ['$status', 'DONE'] },
									{ $eq: ['$winnerId', null] },
								],
							},
							1,
							0,
						],
					},
				},
			},
		},
		{
			$project: {
				_id: 0,
				DONE: { $ifNull: ['$DONE', 0] },
				CANCELED: { $ifNull: ['$CANCELED', 0] },
				PRIVATE: { $ifNull: ['$PRIVATE', 0] },
				PUBLIC: { $ifNull: ['$PUBLIC', 0] },
				WIN: { $ifNull: ['$WIN', 0] },
				LOSE: { $ifNull: ['$LOSE', 0] },
				DRAW: { $ifNull: ['$DRAW', 0] },
			},
		},
	]);

	return !stats.length
		? {
				DONE: 0,
				CANCELED: 0,
				PRIVATE: 0,
				PUBLIC: 0,
				WIN: 0,
				LOSE: 0,
				DRAW: 0,
		  }
		: stats[0];
}

/**
 * Calculate admin games day by day
 */
async function getAdminStatsByDay() {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 30);

	return Game.aggregate([
		{
			$match: {
				createdAt: { $gte: startDate },
			},
		},
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
				count: { $sum: 1 },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);
}

/**
 * Calculate player games day by day
 */
async function getPlayerStatsByDay(userId) {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 30);

	return Game.aggregate([
		{
			$match: {
				createdAt: { $gte: startDate },
				$or: [{ playerId: userId }, { opponentId: userId }],
			},
		},
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
				count: { $sum: 1 },
			},
		},
		{
			$sort: { _id: 1 },
		},
	]);
}

/**
 * Format stats to get last 30 days
 */
function getLast30Days() {
	const now = new Date();
	const dates = [];

	for (let i = 0; i < 30; i++) {
		const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
		dates.push(date);
	}

	dates.sort(function (a, b) {
		return a - b;
	});
	return dates;
}
function generateLast30DaysList(gamesCountsByDate) {
	const thirtyDaysList = [];

	for (const day of getLast30Days()) {
		const game = gamesCountsByDate.find((game) => game._id === formatDate(day));
		if (game) {
			thirtyDaysList.push({ date: formatDate(day), count: game.count });
		} else {
			thirtyDaysList.push({ date: formatDate(day), count: 0 });
		}
	}

	return thirtyDaysList;
}

/**
 * Count all players
 */
async function countPlayers() {
	return User.count({
		where: {
			role: 'PLAYER',
		},
	});
}

/**
 * Count registration day by day
 */
async function getRegistrationsByDay() {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const playerSubscriptionCount = await User.findAll({
		attributes: [
			[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), '_id'],
			[sequelize.fn('count', sequelize.col('id')), 'count'],
		],
		where: {
			role: 'PLAYER',
			createdAt: {
				[Op.gte]: thirtyDaysAgo,
			},
		},
		group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
		raw: true,
	});

	playerSubscriptionCount.map((p) => (p._id = formatDate(new Date(p._id))));

	return playerSubscriptionCount;
}

/**
 * Format admin stats
 */
async function getAdminStats() {
	return {
		gameStats: await calculateAdminStats(),
		userStats: { PLAYER: await countPlayers() },
		gamesByDay: generateLast30DaysList(await getAdminStatsByDay()),
		registrationsByDay: generateLast30DaysList(await getRegistrationsByDay()),
	};
}

/**
 * Format player stats
 */
async function getPlayerStats(userId) {
	return {
		gameStats: await calculatePlayerStats(userId),
		gamesByDay: generateLast30DaysList(await getPlayerStatsByDay(userId)),
	};
}

module.exports = async function (socket) {
	/**
	 * Get user stats
	 */
	socket.emit('stats', {
		stats:
			socket.user.role === 'ADMIN'
				? await getAdminStats()
				: await getPlayerStats(socket.user.id),
	});
};
