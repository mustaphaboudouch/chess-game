const { verifyToken } = require("../lib/token");

/**
 * Check if user is authenticated
 */
function isAuthenticated(req, res, next) {
	const authorization = req.headers.authorization;
	if (!authorization)
		return res.status(401).json({ message: 'Unauthenticated' });

	const [type, token] = authorization.split(' ');
	if (type !== 'Bearer')
		return res.status(401).json({ message: 'Unauthenticated' });

	const decodedToken = verifyToken(token);
	if (!decodedToken)
		return res.status(401).json({ message: 'Unauthenticated' });

	res.locals.user = decodedToken;
	next();
}

module.exports = isAuthenticated;
