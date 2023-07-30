const isAdmin = require('../../middlewares/isAdmin');
const User = require('../../models/user');

// Mocking User model
jest.mock('../../models/user', () => ({
	findByPk: jest.fn(),
}));

describe('isAdmin middleware', () => {
	// Test 1: User is an admin
	it('should call next() if user is an admin', async () => {
		// Mock the User.findByPk function to return an admin user
		User.findByPk.mockResolvedValueOnce({ role: 'ADMIN' });

		const req = {};
		const res = {
			locals: {
				user: {
					id: 'user_id',
				},
			},
		};
		const next = jest.fn();

		await isAdmin(req, res, next);

		expect(User.findByPk).toHaveBeenCalledWith('user_id');
		expect(next).toHaveBeenCalled();
		expect(res.status).toBeUndefined();
		expect(res.json).toBeUndefined();
	});

	// Test 2: User is not an admin
	it('should return 401 if user is not an admin', async () => {
		// Mock the User.findByPk function to return a non-admin user
		User.findByPk.mockResolvedValueOnce({ role: 'USER' });

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

		await isAdmin(req, res, next);

		expect(User.findByPk).toHaveBeenCalledWith('user_id');
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Not admin' });
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

		await isAdmin(req, res, next);

		expect(User.findByPk).toHaveBeenCalledWith('user_id');
		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
		expect(next).not.toHaveBeenCalled();
	});
});
