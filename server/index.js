require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const authRouter = require('./routes/auth');
const billingRouter = require('./routes/billing');
const { webhook } = require('./controllers/billing');
const Game = require('./models/game');

/**
 * Initialize express app & servers
 */

const app = express();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

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

io.on('connection', async function (socket) {
	console.log(`🚀 ${socket.id} user connected successfully`);

	/**
	 *
	 */
	const game = await Game.findOne({
		$and: [
			{ status: { $in: ['WAITING', 'PLAYING'] } },
			{
				$or: [{ player: socket.user.id }, { opponent: socket.user.id }],
			},
		],
	});
	socket.emit('game-current', { game });

	/**
	 *
	 */
	socket.on('game-create', async function () {
		try {
			const game = await Game.create({
				player: socket.user.id,
				status: 'WAITING',
			});

			if (!game) {
				throw new Error('Game not created');
			}

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
			const game = await Game.findByIdAndUpdate(gameId, {
				opponent: socket.user.id,
				status: 'PLAYING',
			});

			socket.join(gameId);
			socket.to(gameId).emit('game-join-success', { game });
		} catch (error) {
			return socket.emit('game-join-failed', {
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
