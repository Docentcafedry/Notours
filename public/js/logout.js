import { showAlert } from './alerts';
import axios from 'axios';

export async function logout() {
  try {
    const data = await axios.get('http://127.0.0.1:5555/logout');
    showAlert('Logged out', 'success');
    window.setTimeout(() => {
      location.assign('/overview');
    }, 1500);
  } catch (err) {
    console.log(err);
    showAlert(err.response.data.message, 'error');
  }
}
