import { addMap } from './map';
import { login } from './login';
import { logout } from './logout';
import { changeUserInfo } from './changeUserData';

const map = document.getElementById('map');
const loginForm = document.querySelector('.login-form');
const logOutButton = document.querySelector('.log-out');
const changeUserInfoForm = document.querySelector('.form-user-data');
const changeUserPasswordForm = document.querySelector('.form-user-settings');

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
    await logout();
  });
}

if (changeUserInfoForm) {
  changeUserInfoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    await changeUserInfo({ name, email }, 'info');
  });
}

if (changeUserPasswordForm) {
  changeUserPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    await changeUserInfo(
      {
        currentPassword,
        password,
        confirmPassword,
      },
      'password'
    );
  });
}
