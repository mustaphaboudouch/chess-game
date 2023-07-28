const { verifyToken } = require('../lib/token');

module.exports = function (socket, next) {
	const { token } = socket.handshake.auth;

	if (!token) return next(new Error('Unauthenticated'));

	const [type, encodedToken] = token.split(' ');
	if (type !== 'Bearer' || !encodedToken)
		return next(new Error('Unauthenticated'));

	const decodedToken = verifyToken(encodedToken);
	if (!decodedToken) return next(new Error('Unauthenticated'));

	socket.user = decodedToken;
	next();
};
