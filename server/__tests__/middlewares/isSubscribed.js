const isSubscribed = require('../../middlewares/isSubscribed');
const User = require('../../models/user');

// Mock the User.findByPk function
jest.mock('../../models/user', () => ({
	findByPk: jest.fn(),
}));

describe('isSubscribed middleware', () => {
	// Test 1: User is subscribed in PRO plan
	it('should call next() if user is subscribed in PRO plan', async () => {
		// Mock the User.findByPk function to return a subscribed PRO user
		User.findByPk.mockResolvedValueOnce({
			stripePriceId: 'pro_plan_id',
			stripeCurrentPeriodEnd: new Date(Date.now() + 86_400_000), // 24 hours in the future
			role: 'USER',
		});

		const req = {};
		const res = {
			locals: {
				user: {
					id: 'user_id',
				},
			},
		};
		const next = jest.fn();

		await isSubscribed(req, res, next);

		expect(User.findByPk).toHaveBeenCalledWith('user_id');
		expect(next).toHaveBeenCalled();
		expect(res.status).toBeUndefined();
		expect(res.json).toBeUndefined();
	});

	// Test 2: User is not subscribed in PRO plan and not an admin
	it('should return 401 if user is not subscribed in PRO plan and not an admin', async () => {
		// Mock the User.findByPk function to return a non-subscribed user
		User.findByPk.mockResolvedValueOnce({
			stripePriceId: null,
			stripeCurrentPeriodEnd: new Date(Date.now() - 86_400_000), // 24 hours in the past
			role: 'USER',
		});

		const req = {};
		const res = {
			status: jest.fn(() => res),
			json: jest.fn(),
			locals: {
				user: {
					id: 'user_id',
				},
			},
		};
		const next = jest.fn();

		await isSubscribed(req, res, next);

		expect(User.findByPk).toHaveBeenCalledWith('user_id');
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Not subscribed' });
		expect(next).not.toHaveBeenCalled();
	});

	// Test 3: User not found
	it('should return 404 if user is not found', async () => {
		// Mock the User.findByPk function to return null (user not found)
		User.findByPk.mockResolvedValueOnce(null);

		const req = {};
		const res = {
			status: jest.fn(() => res),
			json: jest.fn(),
			locals: {
				user: {
					id: 'user_id',
				},
			},
		};
		const next = jest.fn();

		await isSubscribed(req, res, next);

		expect(User.findByPk).toHaveBeenCalledWith('user_id');
		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
		expect(next).not.toHaveBeenCalled();
	});
});
