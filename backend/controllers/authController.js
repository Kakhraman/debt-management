const authService = require('../services/authService');

async function registerHandler(req, res, next) {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ error: 'Login and password required' });
    const user = await authService.register(login, password);
    res.status(201).json(user);
  } catch (err) {
    if (err.message === 'User already exists') return res.status(409).json({ error: err.message });
    next(err);
  }
}

async function loginHandler(req, res, next) {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ error: 'Login and password required' });
    const result = await authService.login(login, password);
    res.json(result);
  } catch (err) {
    if (err.message === 'Invalid credentials') return res.status(401).json({ error: err.message });
    next(err);
  }
}

module.exports = { registerHandler, loginHandler };
