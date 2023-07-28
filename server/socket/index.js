const gameHandlers = require('./gameHandlers');
const statsHandlers = require('./statsHandlers');

module.exports = async function (socket) {
	console.log(`🚀 ${socket.id} user connected successfully`);

	/**
	 * Join admins room
	 */
	if (socket.user.role === 'ADMIN') {
		socket.join('admin');
	}

	await statsHandlers(socket);
	await gameHandlers(socket);

	/**
	 * User disconnect
	 */
	socket.on('disconnect', function () {
		console.log(`💤 ${socket.id} user disconnected successfully`);

		// Leave admins room
		if (socket.user.role === 'ADMIN') {
			socket.leave('admin');
		}
	});
};
