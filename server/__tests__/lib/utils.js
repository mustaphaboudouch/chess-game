const { generateCode, elo } = require('../../lib/utils');

describe('generateCode', () => {
	it('returns a string', () => {
		expect(typeof generateCode()).toBe('string');
	});

	it('returns a string of length 6', () => {
		expect(generateCode().length).toBe(6);
	});

	it('returns a random code', () => {
		const code1 = generateCode();
		const code2 = generateCode();
		expect(code1).not.toBe(code2);
	});

	it('returns a code containing only numbers and uppercase letters', () => {
		const code = generateCode();
		expect(code).toMatch(/^[0-9A-Z]+$/);
	});
});

describe('elo', () => {
	it('returns an array', () => {
		const result = elo(100, 100);
		expect(Array.isArray(result)).toBe(true);
	});

	it('returns array with 2 elements', () => {
		const result = elo(100, 100);
		expect(result.length).toBe(2);
	});

	it('returns updated scores', () => {
		const [winnerScore, loserScore] = elo(100, 100);
		expect(winnerScore).toBeGreaterThan(100);
		expect(loserScore).toBeLessThan(100);
	});

	it('updates scores correctly', () => {
		const [winnerScore, loserScore] = elo(100, 100);
		expect(winnerScore).toBe(116);
		expect(loserScore).toBe(84);
	});

	it('does not allow loser score below 0', () => {
		const [winnerScore, loserScore] = elo(100, 0);
		expect(loserScore).toBe(0);
	});

	it('uses custom kFactor', () => {
		const [winnerScore, loserScore] = elo(100, 100, 64);
		expect(winnerScore).toBe(132);
		expect(loserScore).toBe(68);
	});
});
