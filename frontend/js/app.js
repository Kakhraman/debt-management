import { api } from './api.js';
import { initDashboard, loadDashboard } from '../components/dashboard.js';
import { initDebtForm } from '../components/debtForm.js';
import { renderDebtDetail } from '../components/debtDetail.js';
import { showToast } from './utils.js';

const pages = {
  dashboard: document.getElementById('page-dashboard'),
  form: document.getElementById('page-form'),
  detail: document.getElementById('page-detail'),
};

function showPage(name) {
  Object.entries(pages).forEach(([k, el]) => {
    el.classList.toggle('active', k === name);
  });
}

// Wire up global debt select callback
window._onDebtSelect = (id) => {
  showPage('detail');
  renderDebtDetail(id, () => {
    showPage('dashboard');
    loadDashboard();
  });
};

// Init components
initDashboard(
  (id) => window._onDebtSelect(id),
  () => showPage('form')
);

initDebtForm(
  () => {
    showPage('dashboard');
    loadDashboard();
  },
  () => showPage('dashboard')
);

showPage('dashboard');

// ─── AUTH ────────────────────────────────────────────────────────────────────
const authScreen = document.getElementById('auth-screen');
const appEl = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');

function checkAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    authScreen.style.display = 'none';
    appEl.style.display = 'block';
    document.getElementById('username-display').textContent = localStorage.getItem('login') || '';
  } else {
    authScreen.style.display = 'flex';
    appEl.style.display = 'none';
    // Clear CSS custom properties so the inline-script values don't persist
    document.documentElement.style.removeProperty('--auth-display');
    document.documentElement.style.removeProperty('--app-display');
  }
}

showRegisterBtn?.addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
});

showLoginBtn?.addEventListener('click', () => {
  registerForm.style.display = 'none';
  loginForm.style.display = 'block';
});

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const login = loginForm.querySelector('[name=login]').value;
  const password = loginForm.querySelector('[name=password]').value;
  const btn = loginForm.querySelector('[type=submit]');
  btn.disabled = true;
  try {
    const { token, user } = await api.login(login, password);
    localStorage.setItem('token', token);
    localStorage.setItem('login', user.login);
    checkAuth();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const login = registerForm.querySelector('[name=login]').value;
  const password = registerForm.querySelector('[name=password]').value;
  const btn = registerForm.querySelector('[type=submit]');
  btn.disabled = true;
  try {
    await api.register(login, password);
    showToast('Account created — please log in', 'success');
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('btn-logout')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('login');
  checkAuth();
});

checkAuth();
