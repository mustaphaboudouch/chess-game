require('dotenv').config();

const bcrypt = require('bcrypt');
const { signUp, signIn, me, updateProfile } = require('../../controllers/auth');
const User = require('../../models/user');
const Game = require('../../models/game');
const { buildToken } = require('../../lib/token');

jest.mock('bcrypt');
jest.mock('../../models/user');
jest.mock('../../models/game');
jest.mock('../../lib/token');

// Test suite for the 'signUp' function
describe('signUp', () => {
  test('should create a new user and return a token', async () => {
    const req = {
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockHash = 'mockedHash';
    const mockUser = { id: 1, role: 'PLAYER' };
    const mockToken = 'mockedToken';

    bcrypt.hashSync.mockReturnValue(mockHash);
    User.create.mockResolvedValue(mockUser);
    buildToken.mockReturnValue(mockToken);

    await signUp(req, res);

    expect(bcrypt.hashSync).toHaveBeenCalledWith(req.body.password, 10);
    expect(User.create).toHaveBeenCalledWith({
      username: req.body.username,
      email: req.body.email,
      password: mockHash,
      role: 'PLAYER',
      score: 100,
    });
    expect(buildToken).toHaveBeenCalledWith(mockUser);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ token: mockToken });
  });

  test('should handle errors and return 500 status with an error message', async () => {
    const req = {
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockError = new Error('Test error');

    bcrypt.hashSync.mockReturnValue('mockedHash');
    User.create.mockRejectedValue(mockError);

    await signUp(req, res);

    expect(bcrypt.hashSync).toHaveBeenCalledWith(req.body.password, 10);
    expect(User.create).toHaveBeenCalledWith({
      username: req.body.username,
      email: req.body.email,
      password: 'mockedHash',
      role: 'PLAYER',
      score: 100,
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
  });
});
