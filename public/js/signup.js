import { showAlert } from './alerts';
import axios from 'axios';

export const signup = async (name, email, password, confirmPassword) => {
  try {
    const data = await axios.post('http://127.0.0.1:5555/api/v1/users/signup', {
      name,
      email,
      password,
      confirmPassword,
    });
    console.log(data);
    showAlert('Check your email for an activation link', 'success');
    window.setTimeout(() => {
      location.assign('/overview');
    }, 2000);
  } catch (err) {
    console.log(err);
    showAlert(err, 'error');
  }
};
