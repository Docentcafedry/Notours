import { addMap } from './map';
import { login } from './login';
import { logout } from './logout';
import { changeUserInfo } from './changeUserData';
import { bookTour } from './book-tour';
import { signup } from './signup';

const map = document.getElementById('map');
const loginForm = document.querySelector('.login-form');
const signupFrom = document.querySelector('.signup-form');
const logOutButton = document.querySelector('.log-out');
const changeUserInfoForm = document.querySelector('.form-user-data');
const changeUserPasswordForm = document.querySelector('.form-user-settings');
const bookTourButton = document.getElementById('book-button');

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

if (signupFrom) {
  signupFrom.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    console.log(name, email, password, confirmPassword);

    await signup(name, email, password, confirmPassword);
  });
}

if (logOutButton) {
  logOutButton.addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
  });
}

if (changeUserInfoForm) {
  changeUserInfoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', document.getElementById('name').value);
    data.append('email', document.getElementById('email').value);
    data.append('photo', document.getElementById('photo').files[0]);

    await changeUserInfo(data, 'info');
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

if (bookTourButton) {
  bookTourButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const dateInput = document.getElementById('dates').value;
    const tourDate = new Date(dateInput).toISOString();
    const { tourId } = e.target.dataset;
    e.target.textContent = 'Processing';
    await bookTour(tourId, tourDate);
  });
}
