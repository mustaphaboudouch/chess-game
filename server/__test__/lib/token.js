const jwt = require("jsonwebtoken");
const { buildToken,verifyToken } = require("../../lib/token");

describe("buildToken", () => {

  const secretKey = 'test-token-secret-key';

  beforeEach(() => {
    process.env.TOKEN_SECRET_KEY = secretKey;
  });

  afterEach(() => {
    process.env.TOKEN_SECRET_KEY = undefined;
  });

  test("should return a string", () => {
    const user = {
      id: 1,
      username: "henry_spender",
      role: "PLAYER",
      score: 100,
    };
    const token = buildToken(user);
    expect(typeof token).toBe("string");
  });

  test("should return a valid token", () => {
    const user = {
      id: 2,
      username: "henry_spender",
      role: "ADMIN",
      score: 200,
    };
    const token = buildToken(user);
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    expect(decoded).toHaveProperty("id", user.id);
    expect(decoded).toHaveProperty("username", user.username);
    expect(decoded).toHaveProperty("role", user.role);
    expect(decoded).toHaveProperty("score", user.score);
  });

  test("should expire after 604800 seconds", () => {
    const user = {
      id: 3,
      username: "henry_spender",
      role: "PLAYER",
      score: 50,
    };
    const token = buildToken(user);
    const decoded = jwt.decode(token);
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    const expiresIn = expirationTime - now;
    expect(expiresIn).toBe(604800);
  });
});

describe('verifyToken', () => {

  test('should verify a valid token and return the decoded data', () => {
    // Créez un token valide avec des données fictives
    const payload = {
      id: 1,
      username: "henry_spender",
      role: "PLAYER",
      score: 100,
    };
    const token = jwt.sign(payload, process.env.TOKEN_SECRET_KEY);

    // Appelez la fonction à tester
    const result = verifyToken(token);

    // Vérifiez les assertions
    expect(result).toMatchObject(payload);
  });

  test('should return undefined for an invalid token', () => {
    // Créez un token invalide (données fictives)
    const invalidToken = 'un-token-invalide';

    // Appelez la fonction à tester
    const result = verifyToken(invalidToken);

    // Vérifiez les assertions
    expect(result).toBeUndefined();
  });

  test('should return undefined for a token with an expired signature', () => {
    // Créez un token avec une signature expirée (données fictives)
    const expiredPayload = { id: 2, username: 'jane_doe' };
    const expiredToken = jwt.sign(expiredPayload, process.env.TOKEN_SECRET_KEY, { expiresIn: '0s' });

    // Appelez la fonction à tester
    const result = verifyToken(expiredToken);

    // Vérifiez les assertions
    expect(result).toBeUndefined();
  });
});