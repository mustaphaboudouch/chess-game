const { Chess } = require('chess.js');
const User = require('../models/user');
const Game = require('../models/game');
const { generateCode, elo } = require('../lib/utils');
const { getSubscriptionPlan } = require('../lib/subscription');

/**
 * Get all user ongoing games
 */
async function getOnGoingGames() {
	const games = await Game.find({
		status: 'WAITING',
		visibility: 'PUBLIC',
	});

	const newGames = [];

	for (const game of games) {
		newGames.push({
			...game.toObject(),
			player: await User.findByPk(game.playerId),
		});
	}

	return newGames;
}

/**
 * Update user score using ELO system
 */
async function updateScores(game) {
	const player = await User.findByPk(game.playerId);
	const opponent = await User.findByPk(game.opponentId);

	const [winnerScore, loserScore] = elo(
		game.winnerId === player.id ? player.score : opponent.score,
		game.winnerId !== player.id ? player.score : opponent.score,
	);

	player.set({
		score: game.winnerId === player.id ? winnerScore : loserScore,
	});
	await player.save();

	opponent.set({
		score: game.winnerId === opponent.id ? winnerScore : loserScore,
	});
	await opponent.save();
}

/**
 * Decrement user score
 */
async function decrementScore(userId) {
	const user = await User.findByPk(userId);

	if (user.score >= 10) {
		await user.decrement('score', { by: 10 });
	} else {
		user.set({ score: 0 });
		await user.save();
	}
}

/**
 * Decrement user score
 */
async function countTodayGames(userId) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const gamesCount = await Game.countDocuments({
		$and: [
			{
				opponentId: { $exists: true, $ne: null },
				createdAt: { $gte: today, $lt: tomorrow },
			},
			{
				$or: [{ playerId: userId }, { opponentId: userId }],
			},
		],
	});

	return gamesCount;
}

/**
 * Check if user is allowed to create/join game
 */
async function isAllowedToPlay(userId) {
	const user = await User.findByPk(userId);
	if (user.role === 'ADMIN') {
		return true;
	}

	const plan = getSubscriptionPlan(user);
	if (plan === 'PRO') {
		return true;
	}

	const countGames = await countTodayGames(userId);
	return countGames < 5;
}

/**
 * Get all games by statuses
 */
async function getAdminGamesByStatus(status) {
	const gamesWithUsername = [];
	const games = await Game.find({ status });

	for (const game of games) {
		const player = await User.findByPk(game.playerId);
		const opponent = await User.findByPk(game.opponentId);

		gamesWithUsername.push({
			...game.toObject(),
			playerUsername: player?.username,
			opponentUsername: opponent?.username,
		});
	}

	return gamesWithUsername;
}

async function getAdminGames(statuses) {
	const games = {};

	for (const status of statuses) {
		games[status] = await getAdminGamesByStatus(status);
	}

	return games;
}

module.exports = async function (socket) {
	/**
	 * Get current game
	 */
	const currentGame = await Game.findOne({
		$and: [
			{ status: { $in: ['WAITING', 'PLAYING'] } },
			{
				$or: [{ playerId: socket.user.id }, { opponentId: socket.user.id }],
			},
		],
	});
	if (currentGame) {
		socket.join(currentGame._id.toString());
		socket.emit('game-current', { game: currentGame });
	}

	/**
	 * Get user on going games
	 */
	const games = await getOnGoingGames(socket.user);
	socket.broadcast.emit('game-list', { games });
	socket.emit('game-list', { games });

	/**
	 * Get all games (for admin)
	 */
	const user = await User.findByPk(socket.user.id);
	if (user.role === 'ADMIN') {
		const allGames = await getAdminGames([
			'WAITING',
			'PLAYING',
			'DONE',
			'CANCELED',
		]);
		socket.emit('game-admin-list', { games: allGames });
	}

	/**
	 * Create new game
	 */
	socket.on('game-create', async function ({ visibility }) {
		try {
			const isAllowed = await isAllowedToPlay(socket.user.id);
			if (!isAllowed) {
				throw new Error('You need to subscribe to play unlimited games');
			}

			const currentGame = await Game.findOne({
				$and: [
					{ status: { $in: ['WAITING', 'PLAYING'] } },
					{
						$or: [{ playerId: socket.user.id }, { opponentId: socket.user.id }],
					},
				],
			});

			if (currentGame) {
				throw new Error('You have already a game');
			}

			let code = null;
			let gameWithCode = null;

			if (visibility === 'PRIVATE') {
				do {
					code = generateCode();
					gameWithCode = await Game.findOne({ code });
				} while (!!gameWithCode);
			}

			const game = await Game.create({
				playerId: socket.user.id,
				status: 'WAITING',
				visibility,
				code,
			});

			if (!game) {
				throw new Error('Game not created');
			}

			const games = await getOnGoingGames(socket.user);
			socket.broadcast.emit('game-list', { games });
			socket.emit('game-list', { games });

			socket.join(game._id.toString());
			socket.emit('game-create-success', { game });

			const allGames = await getAdminGames(['WAITING']);
			socket.to('admin').emit('game-admin-list', { games: allGames });
			if (user.role === 'ADMIN') {
				socket.emit('game-admin-list', { games: allGames });
			}

			const adminStats = await getAdminStats();
			const playerStats = await getPlayerStats(socket.user.id);
			socket.to('admin').emit('stats', { stats: adminStats });
			socket.emit('stats', {
				stats: socket.user.role === 'ADMIN' ? adminStats : playerStats,
			});
		} catch (error) {
			socket.emit('game-create-failed', { message: error.message });
		}
	});

	/**
	 * Join a public game
	 */
	socket.on('game-join-public', async function ({ gameId }) {
		try {
			const isAllowed = await isAllowedToPlay(socket.user.id);
			if (!isAllowed) {
				throw new Error('You need to subscribe to play unlimited games');
			}

			const hasGame = await Game.findOne({
				_id: { $ne: gameId },
				playerId: socket.user.id,
				status: { $in: ['WAITING', 'PLAYING'] },
			});

			if (hasGame) {
				throw new Error('You have already a game');
			}

			const currentGame = await Game.findOne({
				$and: [
					{
						_id: gameId,
						visibility: 'PUBLIC',
						status: { $in: ['WAITING', 'PLAYING'] },
					},
					{
						$or: [
							{ opponentId: null },
							{
								$or: [
									{ playerId: socket.user.id },
									{ opponentId: socket.user.id },
								],
							},
						],
					},
				],
			});

			if (!currentGame) {
				throw new Error('Game not found');
			}

			if (currentGame.playerId !== socket.user.id && !currentGame.opponentId) {
				await Game.findByIdAndUpdate(currentGame._id, {
					opponentId: socket.user.id,
					status: 'PLAYING',
				});
			}

			const game = await Game.findById(currentGame._id);

			const games = await getOnGoingGames(socket.user);
			socket.broadcast.emit('game-list', { games });
			socket.emit('game-list', { games });

			socket.join(game._id.toString());
			socket.to(game._id.toString()).emit('game-join-success', { game });
			socket.emit('game-join-success', { game });

			const allGames = await getAdminGames(['WAITING', 'PLAYING']);
			socket.to('admin').emit('game-admin-list', { games: allGames });
			if (user.role === 'ADMIN') {
				socket.emit('game-admin-list', { games: allGames });
			}

			const adminStats = await getAdminStats();
			const playerStats = await getPlayerStats(socket.user.id);
			const opponentStats = await getPlayerStats(game.playerId);
			socket.to('admin').emit('stats', { stats: adminStats });
			socket.to(game._id.toString()).emit('stats', {
				stats: socket.user.role === 'ADMIN' ? adminStats : opponentStats,
			});
			socket.emit('stats', {
				stats: socket.user.role === 'ADMIN' ? adminStats : playerStats,
			});
		} catch (error) {
			socket.emit('game-join-failed', { message: error.message });
		}
	});

	/**
	 * Join a private game
	 */
	socket.on('game-join-private', async function ({ code }) {
		try {
			const isAllowed = await isAllowedToPlay(socket.user.id);
			if (!isAllowed) {
				throw new Error('You need to subscribe to play unlimited games');
			}

			const hasGame = await Game.findOne({
				code: { $ne: code },
				playerId: socket.user.id,
				status: { $in: ['WAITING', 'PLAYING'] },
			});

			if (hasGame) {
				throw new Error('You have already a game');
			}

			const currentGame = await Game.findOne({
				$and: [
					{
						code,
						visibility: 'PRIVATE',
						status: { $in: ['WAITING', 'PLAYING'] },
					},
					{
						$or: [
							{ opponentId: null },
							{
								$or: [
									{ playerId: socket.user.id },
									{ opponentId: socket.user.id },
								],
							},
						],
					},
				],
			});

			if (!currentGame) {
				throw new Error('Game not found');
			}

			if (currentGame.playerId !== socket.user.id && !currentGame.opponentId) {
				await Game.findByIdAndUpdate(currentGame._id, {
					opponentId: socket.user.id,
					status: 'PLAYING',
				});
			}

			const game = await Game.findById(currentGame._id);

			const games = await getOnGoingGames(socket.user);
			socket.broadcast.emit('game-list', { games });
			socket.emit('game-list', { games });

			socket.join(game._id.toString());
			socket.to(game._id.toString()).emit('game-join-success', { game });
			socket.emit('game-join-success', { game });

			const allGames = await getAdminGames(['WAITING', 'PLAYING']);
			socket.to('admin').emit('game-admin-list', { games: allGames });
			if (user.role === 'ADMIN') {
				socket.emit('game-admin-list', { games: allGames });
			}

			const adminStats = await getAdminStats();
			const playerStats = await getPlayerStats(socket.user.id);
			const opponentStats = await getPlayerStats(game.playerId);
			socket.to('admin').emit('stats', { stats: adminStats });
			socket.to(game._id.toString()).emit('stats', {
				stats: socket.user.role === 'ADMIN' ? adminStats : opponentStats,
			});
			socket.emit('stats', {
				stats: socket.user.role === 'ADMIN' ? adminStats : playerStats,
			});
		} catch (error) {
			socket.emit('game-join-failed', { message: error.message });
		}
	});

	/**
	 * Make a move
	 */
	socket.on('game-move', async function ({ gameId, move }) {
		try {
			const currentGame = await Game.findById(gameId);

			if (!currentGame) {
				throw new Error('Game not found');
			}

			const chess = new Chess(currentGame.fen);

			if (
				(chess.turn() === 'w' && currentGame.playerId !== socket.user.id) ||
				(chess.turn() === 'b' && currentGame.opponentId !== socket.user.id)
			) {
				throw new Error("It's not your turn");
			}

			const isMoveLeggal = chess.move(move);

			if (!isMoveLeggal) {
				throw new Error('Illegal move');
			}

			// check if is checkmate
			if (chess.isCheckmate()) {
				await Game.findByIdAndUpdate(currentGame._id, {
					fen: chess.fen(),
					status: 'DONE',
					winnerId:
						chess.turn() === 'b'
							? currentGame.playerId
							: currentGame.opponentId,
				});

				const game = await Game.findById(currentGame._id);
				updateScores(game);

				socket.to(gameId).emit('game-checkmate', { game });
				socket.emit('game-checkmate', { game });

				const allGames = await getAdminGames(['PLAYING', 'DONE']);
				socket.to('admin').emit('game-admin-list', { games: allGames });
				if (user.role === 'ADMIN') {
					socket.emit('game-admin-list', { games: allGames });
				}

				const adminStats = await getAdminStats();
				const playerStats = await getPlayerStats(socket.user.id);
				const opponentStats = await getPlayerStats(
					game.playerId === socket.user.id ? game.playerId : game.opponentId,
				);
				socket.to('admin').emit('stats', { stats: adminStats });
				socket.to(game._id.toString()).emit('stats', {
					stats: socket.user.role === 'ADMIN' ? adminStats : opponentStats,
				});
				socket.emit('stats', {
					stats: socket.user.role === 'ADMIN' ? adminStats : playerStats,
				});

				return;
			}

			// check if is draw
			if (chess.isDraw()) {
				await Game.findByIdAndUpdate(currentGame._id, {
					fen: chess.fen(),
					status: 'DONE',
				});

				const game = await Game.findById(currentGame._id);

				socket.to(gameId).emit('game-draw', { game });
				socket.emit('game-draw', { game });

				const allGames = await getAdminGames(['PLAYING', 'DONE']);
				socket.to('admin').emit('game-admin-list', { games: allGames });
				if (user.role === 'ADMIN') {
					socket.emit('game-admin-list', { games: allGames });
				}

				const adminStats = await getAdminStats();
				const playerStats = await getPlayerStats(socket.user.id);
				const opponentStats = await getPlayerStats(
					game.playerId === socket.user.id ? game.playerId : game.opponentId,
				);
				socket.to('admin').emit('stats', { stats: adminStats });
				socket.to(game._id.toString()).emit('stats', {
					stats: socket.user.role === 'ADMIN' ? adminStats : opponentStats,
				});
				socket.emit('stats', {
					stats: socket.user.role === 'ADMIN' ? adminStats : playerStats,
				});

				return;
			}

			await Game.findByIdAndUpdate(currentGame._id, {
				fen: chess.fen(),
			});

			const game = await Game.findById(currentGame._id);

			socket.to(gameId).emit('game-move-success', { game });
			socket.emit('game-move-success', { game });
		} catch (error) {
			const game = await Game.findById(gameId);
			socket.emit('game-move-failed', { game, message: error.message });
		}
	});

	/**
	 * Quit a game
	 */
	socket.on('game-quit', async function ({ gameId }) {
		try {
			const currentGame = await Game.findOne({
				$and: [
					{
						_id: gameId,
						status: { $in: ['WAITING', 'PLAYING'] },
					},
					{
						$or: [{ playerId: socket.user.id }, { opponentId: socket.user.id }],
					},
				],
			});

			if (!currentGame) {
				throw new Error('Game not found');
			}

			if (currentGame.status === 'PLAYING') {
				decrementScore(socket.user.id);
			}

			await Game.findByIdAndUpdate(gameId, {
				status: 'CANCELED',
			});

			const games = await getOnGoingGames(socket.user);
			socket.broadcast.emit('game-list', { games });
			socket.emit('game-list', { games });

			socket.to(gameId).emit('game-quit-success');
			socket.emit('game-quit-success');
			socket.leave(gameId);

			const allGames = await getAdminGames(['WAITING', 'PLAYING', 'CANCELED']);
			socket.to('admin').emit('game-admin-list', { games: allGames });
			if (user.role === 'ADMIN') {
				socket.emit('game-admin-list', { games: allGames });
			}

			const adminStats = await getAdminStats();
			const playerStats = await getPlayerStats(socket.user.id);
			socket.to('admin').emit('stats', { stats: adminStats });
			socket.emit('stats', {
				stats: socket.user.role === 'ADMIN' ? adminStats : playerStats,
			});

			if (currentGame.status === 'PLAYING') {
				const opponentStats = await getPlayerStats(
					currentGame.playerId === socket.user.id
						? currentGame.playerId
						: currentGame.opponentId,
				);
				socket.to(currentGame._id.toString()).emit('stats', {
					stats: socket.user.role === 'ADMIN' ? adminStats : opponentStats,
				});
			}
		} catch (error) {
			socket.emit('game-quit-failed', { message: error.message });
		}
	});

	/**
	 * Admin: Cancel a game
	 */
	socket.on('game-cancel', async function ({ gameId }) {
		try {
			if (socket.user.role !== 'ADMIN') {
				throw new Error('You are not allowed');
			}

			const game = await Game.findById(gameId);

			if (!game) {
				throw new Error('Game not found');
			}

			await Game.findByIdAndUpdate(gameId, {
				status: 'CANCELED',
			});

			socket.to(gameId).emit('game-cancel-success');

			const allGames = await getAdminGames(['WAITING', 'PLAYING', 'CANCELED']);
			socket.to('admin').emit('game-admin-list', { games: allGames });
			socket.emit('game-admin-list', { games: allGames });
		} catch (error) {
			socket.emit('game-cancel-failed', { message: error.message });
		}
	});

	/**
	 * Admin: Delete a game
	 */
	socket.on('game-delete', async function ({ gameId }) {
		try {
			if (socket.user.role !== 'ADMIN') {
				throw new Error('You are not allowed');
			}

			const game = await Game.findById(gameId);

			if (!game) {
				throw new Error('Game not found');
			}

			await Game.findByIdAndDelete(gameId);

			socket.to(gameId).emit('game-delete-success');

			const allGames = await getAdminGames([
				'WAITING',
				'PLAYING',
				'DONE',
				'CANCELED',
			]);
			socket.to('admin').emit('game-admin-list', { games: allGames });
			socket.emit('game-admin-list', { games: allGames });
		} catch (error) {
			socket.emit('game-delete-failed', { message: error.message });
		}
	});
};
