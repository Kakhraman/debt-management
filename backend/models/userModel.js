const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function createUser(login, password) {
  const hashed = await bcrypt.hash(password, 10);
  return {
    id: uuidv4(),
    login,
    password: hashed,
  };
}

async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { createUser, verifyPassword };
