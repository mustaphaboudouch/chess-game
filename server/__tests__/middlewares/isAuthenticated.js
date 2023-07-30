const isAuthenticated = require('../../middlewares/isAuthenticated');

// Mock the req and res objects
const createMocks = () => {
	const req = {
		headers: {
			authorization: '',
		},
	};
	const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn(),
		locals: {},
	};

	return { req, res };
};

// Mock the jwt.verify function to simulate valid and invalid tokens
jest.mock('jsonwebtoken', () => ({
	verify: jest.fn((token, secret) => {
		if (token === 'valid_token') {
			return { userId: 'user123' };
		} else {
			throw new Error('Invalid token');
		}
	}),
}));

describe('isAuthenticated middleware', () => {
	it('should return 401 if authorization header is missing', () => {
		const { req, res } = createMocks();
		isAuthenticated(req, res);
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Unauthenticated' });
	});

	it('should return 401 if authorization type is not Bearer', () => {
		const { req, res } = createMocks();
		req.headers.authorization = 'InvalidType token123';
		isAuthenticated(req, res);
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Unauthenticated' });
	});

	it('should return 401 if token is invalid', () => {
		const { req, res } = createMocks();
		req.headers.authorization = 'Bearer invalid_token';
		isAuthenticated(req, res);
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Unauthenticated' });
	});

	it('should set the user in res.locals and call next() if token is valid', () => {
		const { req, res } = createMocks();
		req.headers.authorization = 'Bearer valid_token';
		isAuthenticated(req, res, () => {}); // next() is mocked as an empty function
		expect(res.locals.user).toEqual({ userId: 'user123' });
	});
});
