const jwt = require('jsonwebtoken');
const { readDb, writeDb } = require('../utils/fileDb');
const { createUser, verifyPassword } = require('../models/userModel');

const SECRET = process.env.JWT_SECRET || 'fallback-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function register(login, password) {
  const users = readDb('users');
  if (users.find((u) => u.login === login)) {
    throw new Error('User already exists');
  }
  const user = await createUser(login, password);
  users.push(user);
  writeDb('users', users);
  return { id: user.id, login: user.login };
}

async function login(login, password) {
  const users = readDb('users');
  const user = users.find((u) => u.login === login);
  if (!user) throw new Error('Invalid credentials');

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user.id, login: user.login }, SECRET, { expiresIn: EXPIRES_IN });
  return { token, user: { id: user.id, login: user.login } };
}

module.exports = { register, login };
