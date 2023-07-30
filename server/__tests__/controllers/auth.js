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

describe("signIn", () => {
  it("should sign in an existing user and return a token", async () => {
    const req = {
      body: { email: "test@example.com", password: "password123" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = {
      id: "user123",
      email: "test@example.com",
      password: "hashedPassword123",
    };
    const token = "generatedToken123";

    User.findOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    buildToken.mockReturnValue(token);

    await signIn(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: req.body.email },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      req.body.password,
      user.password
    );
    expect(buildToken).toHaveBeenCalledWith(user);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token });
  });

  it("should return 401 for invalid credentials (password does not match)", async () => {
    const req = {
      body: { email: "test@example.com", password: "wrongpassword" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = {
      id: "user123",
      email: "test@example.com",
      password: "hashedPassword123",
    };

    User.findOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    await signIn(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("should return 500 if an error occurs during sign-in", async () => {
    const req = {
      body: { email: "test@example.com", password: "password123" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const error = new Error("Some database error");

    User.findOne.mockRejectedValue(error);

    await signIn(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: error.message });
  });
});

describe("me", () => {
  it("should get the logged-in user and return user data with games count", async () => {
    const req = {};
    const res = {
      locals: { user: { id: "user123" } },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      id: "user123",
      username: "testuser",
      email: "test@example.com",
      toJSON: jest.fn().mockReturnValue({
        id: "user123",
        username: "testuser",
        email: "test@example.com",
      }),
    };
    const gamesCount = 5;

    User.findByPk.mockResolvedValue(user);
    Game.countDocuments.mockResolvedValue(gamesCount);

    await me(req, res);

    expect(User.findByPk).toHaveBeenCalledWith(res.locals.user.id, {
      attributes: { exclude: ["password"] },
    });
    expect(Game.countDocuments).toHaveBeenCalledWith({
      $or: [{ playerId: user.id }, { opponentId: user.id }],
    });
    expect(user.toJSON).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ...user.toJSON(), gamesCount });
  });

  it("should return 404 if the logged-in user is not found", async () => {
    const req = {};
    const res = {
      locals: { user: { id: "user123" } },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findByPk.mockResolvedValue(null);

    await me(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 500 if an error occurs while getting the logged-in user", async () => {
    const req = {};
    const res = {
      locals: { user: { id: "user123" } },
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const error = new Error("Some database error");

    User.findByPk.mockRejectedValue(error);

    await me(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: error.message });
  });
});
