require('dotenv').config();

const express = require('express');
const cors = require('cors');

/**
 * Initialize express app
 */

const app = express();

/**
 * Middlewares
 */

app.use(cors({ origin: '*' }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Routes
 */

app.get('/', function (req, res) {
	res.send('Chess Game API');
});

/**
 * Run HTTP server
 */

const PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
	console.log(`🚀 HTTP server is running on port ${PORT}`);
});
