require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const authRouter = require('./routes/auth');
const billingRouter = require('./routes/billing');
const { webhook } = require('./controllers/billing');
const matchRouter = require('./routes/match');

/**
 * Initialize express app & servers
 */

const app = express();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:5173' } });

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

app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Routes
 */

app.get('/', function (req, res) {
	res.send('Chess Game API');
});
app.use('/', authRouter);
app.use('/', billingRouter);
app.use('/', matchRouter);

/**
 * Run socket server
 */

io.on('connection', function (socket) {
	console.log(`🚀 ${socket.id} user connected successfully`);

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
