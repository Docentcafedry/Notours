import { addMap } from './map';
import { login } from './login';
import { logout } from './logout';

const map = document.getElementById('map');
const loginForm = document.querySelector('.login-form');
const logOutButton = document.querySelector('.log-out');

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  addMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email, password);
  });
}

if (logOutButton) {
  console.log('Button');
  logOutButton.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('from event');
    await logout();
  });
}
