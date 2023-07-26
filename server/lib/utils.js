function generateCode() {
	const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let code = '';

	for (let i = 0; i < 6; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		code += characters[randomIndex];
	}

	return code;
}

const elo = (currentWinnerScore, currentLoserScore, kFactor = 32) => {
	function expectedScore(self, opponent) {
		return 1 / (1 + 10 ** ((opponent - self) / 400));
	}

	function newRating(rating, i) {
		return (
			rating +
			kFactor *
				(i -
					expectedScore(
						i ? currentWinnerScore : currentLoserScore,
						i ? currentLoserScore : currentWinnerScore,
					))
		);
	}

	const winnerScore = Math.round(newRating(currentWinnerScore, 1));
	const loserScore =
		Math.round(newRating(currentLoserScore, 0)) >= 0
			? Math.round(newRating(currentLoserScore, 0))
			: 0;

	return [winnerScore, loserScore];
};

module.exports = { generateCode, elo };
