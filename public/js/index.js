import { addMap } from './map';
import { login } from './login';

const map = document.getElementById('map');
const loginForm = document.querySelector('.login-form');

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
