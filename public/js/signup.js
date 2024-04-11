import { showAlert } from './alerts';

export const signup = async (name, email, password, confirmPassword) => {
  try {
    const data = await axios.post('http://127.0.0.1:5555/api/v1/users/signup', {
      name,
      email,
      password,
      confirmPassword,
    });
    showAlert('Signed up successfully', 'success');
    window.setTimeout(() => {
      location.assign('/overview');
    }, 1500);
  } catch (err) {
    showAlert(err.response.data.message, 'error');
  }
};
