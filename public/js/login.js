import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const data = await axios.post('http://127.0.0.1:5555/api/v1/users/signin', {
      email,
      password,
    });
    showAlert('Logged in successfully', 'success');
    window.setTimeout(() => {
      location.assign('/overview');
    }, 1500);
  } catch (err) {
    showAlert(err.response.data.message, 'error');
  }
};
