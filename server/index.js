require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');

const { verifyToken } = require('./lib/token');
const authRouter = require('./routes/auth');
const billingRouter = require('./routes/billing');
const userRouter = require('./routes/user');
const { webhook } = require('./controllers/billing');
const Game = require('./models/game');
const { generateCode } = require('./lib/utils');

/**
 * Initialize express app & servers
 */

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: '*' },
});

/**
 * MongoDB connection
 */

mongoose
	.connect(process.env.DATABASE_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(function () {
		console.log('💾 Database is connected successfully');
	})
	.catch(function (error) {
		console.error('❌ Database connection failed');
		console.trace(error);
	});

/**
 * Webhooks
 */

app.post('/webhook', express.raw({ type: 'application/json' }), webhook);

/**
 * Middlewares
 */

app.use(cors({ origin: '*' }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

io.use(function (socket, next) {
	const { token } = socket.handshake.auth;

	if (!token) return next(new Error('Unauthenticated'));

	const [type, encodedToken] = token.split(' ');
	if (type !== 'Bearer' || !encodedToken)
		return next(new Error('Unauthenticated'));

	const decodedToken = verifyToken(encodedToken);
	if (!decodedToken) return next(new Error('Unauthenticated'));

	socket.user = decodedToken;
	next();
});

/**
 * Routes
 */

app.get('/', function (req, res) {
	res.send('Chess Game API');
});
app.use('/', authRouter);
app.use('/', billingRouter);
app.use('/', userRouter);

/**
 * Run socket server
 */

async function getOnGoingGames(user) {
	return Game.find({
		status: 'WAITING',
		visibility: 'PUBLIC',
		// TODO: player != user.id
	});
}

io.on('connection', async function (socket) {
	console.log(`🚀 ${socket.id} user connected successfully`);

	/**
	 * Get current game
	 */
	const currentGame = await Game.findOne({
		$and: [
			{ status: { $in: ['WAITING', 'PLAYING'] } },
			{
				$or: [{ player: socket.user.id }, { opponent: socket.user.id }],
			},
		],
	});
	if (currentGame) {
		socket.join(currentGame._id.toString());
		socket.emit('game-current', { game: currentGame });
	}
	const games = await getOnGoingGames(socket.user);
	socket.broadcast.emit('game-list', { games });
	socket.emit('game-list', { games });

	/**
	 * Crate new game
	 */
	socket.on('game-create', async function ({ visibility }) {
		try {
			const currentGame = await Game.findOne({
				$and: [
					{ status: { $in: ['WAITING', 'PLAYING'] } },
					{
						$or: [{ player: socket.user.id }, { opponent: socket.user.id }],
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
				player: socket.user.id,
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
		} catch (error) {
			socket.emit('game-create-failed', { message: error.message });
		}
	});

	/**
	 * Join a public game
	 */
	socket.on('game-join-public', async function ({ gameId }) {
		try {
			const currentGame = await Game.findOne({
				$and: [
					{
						_id: gameId,
						visibility: 'PUBLIC',
						status: { $in: ['WAITING', 'PLAYING'] },
					},
					{
						$or: [
							{ opponent: null },
							{
								$or: [{ player: socket.user.id }, { opponent: socket.user.id }],
							},
						],
					},
				],
			});

			if (!currentGame) {
				throw new Error('Game not found');
			}

			if (
				currentGame.player.toString() !== socket.user.id &&
				!currentGame.opponent
			) {
				await Game.findByIdAndUpdate(currentGame._id, {
					opponent: socket.user.id,
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
		} catch (error) {
			socket.emit('game-join-failed', { message: error.message });
		}
	});

	/**
	 * Join a private game
	 */
	socket.on('game-join-private', async function ({ code }) {
		try {
			const currentGame = await Game.findOne({
				$and: [
					{
						code,
						visibility: 'PRIVATE',
						status: { $in: ['WAITING', 'PLAYING'] },
					},
					{
						$or: [
							{ opponent: null },
							{
								$or: [{ player: socket.user.id }, { opponent: socket.user.id }],
							},
						],
					},
				],
			});

			if (!currentGame) {
				throw new Error('Game not found');
			}

			if (
				currentGame.player.toString() !== socket.user.id &&
				!currentGame.opponent
			) {
				await Game.findByIdAndUpdate(currentGame._id, {
					opponent: socket.user.id,
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
			const isMoveLeggal = chess.move(move);

			if (!isMoveLeggal) {
				throw new Error('Illegal move');
			}

			// TODO: to handle
			if (chess.isCheckmate()) {
				socket.to(gameId).emit('game-checkmate');
				socket.emit('game-checkmate');
				return;
			}

			// TODO: to handle
			if (chess.isDraw()) {
				socket.to(gameId).emit('game-draw');
				socket.emit('game-draw');
				return;
			}

			await Game.findByIdAndUpdate(currentGame._id, {
				fen: chess.fen(),
			});

			const game = await Game.findById(currentGame._id);

			socket.to(gameId).emit('game-move-success', { game });
			socket.emit('game-move-success', { game });
		} catch (error) {
			socket.emit('game-move-failed', { message: error.message });
		}
	});

	/**
	 * Quit a game
	 */
	socket.on('game-quit', async function ({ gameId }) {
		try {
			await Game.findByIdAndUpdate(gameId, {
				status: 'CANCELED',
			});

			const games = await getOnGoingGames(socket.user);
			socket.broadcast.emit('game-list', { games });
			socket.emit('game-list', { games });

			socket.to(gameId).emit('game-quit-success');
			socket.emit('game-quit-success');
			socket.leave(gameId);
		} catch (error) {
			socket.emit('game-quit-failed', { message: error.message });
		}
	});

	/**
	 * User disconnect
	 */
	socket.on('disconnect', function () {
		console.log(`💤 ${socket.id} user disconnected successfully`);
	});
});

/**
 * Run HTTP server
 */

const PORT = process.env.PORT || 3001;

server.listen(PORT, function () {
	console.log(`🚀 HTTP server is running on port ${PORT}`);
});
