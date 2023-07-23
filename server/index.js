require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Chess } = require('chess.js');

const authRouter = require('./routes/auth');
const billingRouter = require('./routes/billing');
const { webhook } = require('./controllers/billing');
const User = require('./models/user');
const Game = require('./models/game');

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

function verifyToken(token) {
	try {
		return jwt.verify(token, process.env.TOKEN_SECRET_KEY);
	} catch (error) {}
}

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

/**
 * Run socket server
 */

async function getCurrentGame(user) {
	const game = await Game.findOne({
		$and: [
			{ status: { $in: ['WAITING', 'PLAYING'] } },
			{
				$or: [{ player: user.id }, { opponent: user.id }],
			},
		],
	});
	return game;
}

async function getStats(userId) {
	const user = await User.findById(userId);

	const stats = {};

	// Admin stats
	if (user.role === 'ADMIN') {
		stats.users = {};
		stats.users.admins = await User.countDocuments({ role: 'ADMIN' });
		stats.users.players = await User.countDocuments({ role: 'PLAYER' });

		stats.games = {};
		stats.games.waiting = await Game.countDocuments({ status: 'WAITING' });
		stats.games.playing = await Game.countDocuments({ status: 'PLAYING' });
		stats.games.done = await Game.countDocuments({ status: 'DONE' });
	}

	// Player stats
	if (user.role === 'PLAYER') {
		stats.games = {};
		stats.games.waiting = await Game.countDocuments({
			$or: [{ player: userId }, { opponent: userId }],
			status: 'WAITING',
		});
		stats.games.playing = await Game.countDocuments({
			$or: [{ player: userId }, { opponent: userId }],
			status: 'PLAYING',
		});
		stats.games.done = await Game.countDocuments({
			$or: [{ player: userId }, { opponent: userId }],
			status: 'DONE',
		});
		stats.games.wins = await Game.countDocuments({
			$or: [{ player: userId }, { opponent: userId }],
			winner: userId,
			status: 'DONE',
		});
	}

	return stats;
}

io.on('connection', async function (socket) {
	console.log(`🚀 ${socket.id} user connected successfully`);

	/**
	 *
	 */
	const game = await getCurrentGame(socket.user);
	socket.emit('game-current', { game });

	/**
	 *
	 */
	const stats = await getStats(socket.user.id);
	socket.emit('stats', { stats });

	/**
	 *
	 */
	socket.on('game-create', async function () {
		try {
			const currentGame = await getCurrentGame(socket.user);

			if (!currentGame) {
				throw new Error('You have already a game');
			}

			const game = await Game.create({
				player: socket.user.id,
				status: 'WAITING',
			});

			if (!game) {
				throw new Error('Game not created');
			}

			socket.join(game._id.toString());
			socket.emit('game-create-success', { game });
		} catch (error) {
			return socket.emit('game-create-failed', {
				message: error.message,
			});
		}
	});

	/**
	 *
	 */
	socket.on('game-join', async function ({ gameId }) {
		try {
			const game = await Game.findById(gameId);

			if (!game) {
				throw new Error('Game not found');
			}

			if (game.player.toString() === socket.user.id) {
				socket.join(gameId);
				socket.to(gameId).emit('game-join-success', { game });
				socket.emit('game-join-success', { game });
				return;
			}

			await Game.findByIdAndUpdate(game, {
				opponent: socket.user.id,
				status: 'PLAYING',
			});

			const updatedGame = await Game.findById(gameId);

			socket.join(gameId);
			socket.to(gameId).emit('game-join-success', { game: updatedGame });
			socket.emit('game-join-success', { game: updatedGame });
		} catch (error) {
			return socket.emit('game-join-failed', {
				message: error.message,
			});
		}
	});

	/**
	 *
	 */
	socket.on('game-move', async function ({ gameId, move }) {
		try {
			const game = await Game.findOne({
				$and: [
					{ _id: gameId, status: 'PLAYING' },
					{
						$or: [{ player: socket.user.id }, { opponent: socket.user.id }],
					},
				],
			});

			if (!game) {
				throw new Error('Game not found');
			}

			const chess = new Chess(game.fen);
			const isMoveLeggal = chess.move(move);

			if (!isMoveLeggal) {
				throw new Error('Illegal move');
			}

			await Game.findByIdAndUpdate(gameId, {
				fen: chess.fen(),
			});

			const newGame = await Game.findById(gameId);

			socket.to(gameId).emit('game-move-success', { game: newGame });
			socket.emit('game-move-success', { game: newGame });
		} catch (error) {
			return socket.emit('game-move-failed', {
				message: error.message,
			});
		}
	});

	/**
	 *
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
