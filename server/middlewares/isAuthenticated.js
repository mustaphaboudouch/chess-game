const jwt = require('jsonwebtoken');

function verifyToken(token) {
	try {
		return jwt.verify(token, process.env.TOKEN_SECRET_KEY);
	} catch (error) {}
}

/**
 * Check if user is authenticated
 */
function isAuthenticated(req, res, next) {
	const token = verifyToken(req.cookies[process.env.TOKEN_COOKIE_NAME]);

	if (!token) {
		return res.status(401).json({ message: 'Unauthenticated' });
	}

	res.locals.token = token;
	next();
}

module.exports = isAuthenticated;
