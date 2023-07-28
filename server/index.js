require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const authRouter = require('./routes/auth');
const billingRouter = require('./routes/billing');
const userRouter = require('./routes/user');
const { webhook } = require('./controllers/billing');
const sequelize = require('./lib/sequelize');
const socketHandlers = require('./socket');
const authMiddleware = require('./socket/authMiddleware');

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
	.connect(process.env.MONGODB_DATABASE_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(function () {
		console.log('💾 MongoDB database is connected successfully');
	})
	.catch(function (error) {
		console.error('❌ MongoDB database connection failed', error.message);
		console.trace(error);
	});

/**
 * Postgres connection
 */

sequelize
	.authenticate()
	.then(() => {
		console.log('💾 Postgres database is connected successfully');
	})
	.catch((error) => {
		console.error('❌ Postgres database connection failed');
		console.trace(error);
	});

sequelize.sync().then(() => {
	console.log('Models created successfully');
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
	authMiddleware(socket, next);
});

/**
 * Routes
 */

app.get('/', function (_, res) {
	res.send('Chess Game API');
});
app.use('/', authRouter);
app.use('/', billingRouter);
app.use('/', userRouter);

/**
 * Run socket server
 */

io.on('connection', async function (socket) {
	await socketHandlers(socket);
});

/**
 * Run HTTP server
 */

const PORT = process.env.PORT || 3001;

server.listen(PORT, function () {
	console.log(`🚀 HTTP server is running on port ${PORT}`);
});
