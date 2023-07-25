const jwt = require('jsonwebtoken');

function buildToken(user) {
	const payload = {
		id: user.id,
		username: user.username,
		role: user.role,
		score: user.score,
	};
	return jwt.sign(payload, process.env.TOKEN_SECRET_KEY, {
		expiresIn: 604800,
	});
}

function verifyToken(token) {
	try {
		return jwt.verify(token, process.env.TOKEN_SECRET_KEY);
	} catch (error) {}
}

module.exports = {
  buildToken,
  verifyToken,
}