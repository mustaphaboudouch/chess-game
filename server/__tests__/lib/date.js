const { formatDate } = require('../../lib/date');

describe('formatDate', () => {
	it('returns date in YYYY-MM-DD format', () => {
		const date = new Date(2020, 1, 15);
		expect(formatDate(date)).toBe('2020-02-15');
	});

	it('adds leading 0 to month if needed', () => {
		const date = new Date(2020, 0, 5);
		expect(formatDate(date)).toBe('2020-01-05');
	});

	it('adds leading 0 to day if needed', () => {
		const date = new Date(2020, 2, 1);
		expect(formatDate(date)).toBe('2020-03-01');
	});

	it('works for different years', () => {
		const date = new Date(2025, 10, 30);
		expect(formatDate(date)).toBe('2025-11-30');
	});

	it('works for December', () => {
		const date = new Date(2020, 11, 31);
		expect(formatDate(date)).toBe('2020-12-31');
	});
});
