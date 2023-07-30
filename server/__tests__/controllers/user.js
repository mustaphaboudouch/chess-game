const { getAll, getById, remove } = require('../../controllers/user');
const User = require('../../models/user');
const Game = require('../../models/game');

// Mock the User and Game models
jest.mock('../../models/user', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));

jest.mock('../../models/game', () => ({
  countDocuments: jest.fn(),
}));

const createMockUser = (id, name, role) => {
  return {
    id,
    name,
    role,
    toJSON() {
      return { id: this.id, name: this.name, role: this.role };
    },
  };
};


describe('getAll', () => {
  it('should return a list of players', async () => {
    const mockedUsers = [
      createMockUser(1, 'Player 1', 'PLAYER'),
      createMockUser(2, 'Player 2', 'PLAYER'),
    ];

    User.findAll.mockResolvedValueOnce(mockedUsers);

    const req = {};
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getAll(req, res);

    expect(User.findAll).toHaveBeenCalledWith({
      where: {
        role: 'PLAYER',
      },
      attributes: { exclude: ['password'] },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockedUsers);
  });

  it('should handle errors', async () => {
    const errorMessage = 'Database error';

    User.findAll.mockRejectedValueOnce(new Error(errorMessage));

    const req = {};
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});


// Test for getById function
describe('getById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a user by ID with gamesCount', async () => {
    const mockedUser = createMockUser(1, 'Player 1', 'PLAYER');
    const mockedGamesCount = 5;

    User.findByPk.mockResolvedValueOnce(mockedUser);
    Game.countDocuments.mockResolvedValueOnce(mockedGamesCount);

    const req = {
      params: { id: 1 },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getById(req, res);

    expect(User.findByPk).toHaveBeenCalledWith(1, {
      attributes: { exclude: ['password'] },
    });
    expect(Game.countDocuments).toHaveBeenCalledWith({
      $or: [{ playerId: 1 }, { opponentId: 1 }],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      name: 'Player 1',
      role: 'PLAYER',
      gamesCount: mockedGamesCount,
    });
  });

  it('should return 404 if user not found', async () => {
    User.findByPk.mockResolvedValueOnce(null);

    const req = {
      params: { id: 1 },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getById(req, res);

    expect(User.findByPk).toHaveBeenCalledWith(1, {
      attributes: { exclude: ['password'] },
    });
    expect(Game.countDocuments).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should handle errors', async () => {
    const errorMessage = 'Database error';

    User.findByPk.mockResolvedValueOnce({ id: 1, name: 'Player 1', role: 'PLAYER' });
    Game.countDocuments.mockRejectedValueOnce(new Error(errorMessage));

    const req = {
      params: { id: 1 },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await getById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});


// Test for remove function
describe('remove', () => {
  it('should remove the user when it exists', async () => {
    const mockUser = { destroy: jest.fn() };
    User.findByPk = jest.fn().mockResolvedValue(mockUser);

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await remove({ params: { id: 1 } }, res);

    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(mockUser.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 404 when the user does not exist', async () => {
    User.findByPk = jest.fn().mockResolvedValue(null);

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await remove({ params: { id: 1 } }, res);

    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 and error message on error', async () => {
    const errorMessage = 'Database error';
    User.findByPk = jest.fn().mockRejectedValue(new Error(errorMessage));

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await remove({ params: { id: 1 } }, res);

    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});