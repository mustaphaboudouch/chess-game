const { formatDate } = require('./lib/date');
const Game = require('./models/game');
const User = require('./models/user');

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

async function countPlayers() {
	return User.count({
		where: {
			role: 'PLAYER',
		},
	});
}

module.exports = {
	calculateAdminStats,
	calculatePlayerStats,
	getAdminStatsByDay,
	getPlayerStatsByDay,
	generateLast30DaysList,
	countPlayers,
};
