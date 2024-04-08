import { showAlert } from './alerts';

export async function changeUserInfo(data, type) {
  try {
    const url =
      type === 'info'
        ? 'http://127.0.0.1:5555/api/v1/users/changeUserInfo'
        : 'http://127.0.0.1:5555/api/v1/users/changePassword';

    const resp = await axios.patch(url, data);
    const typeForAlert = type.charAt(0).toUpperCase() + type.slice(1);
    showAlert(`${typeForAlert} successfully changed!`, 'success');
    window.setTimeout(() => {
      location.assign('/profile/info');
    }, 1500);
  } catch (err) {
    console.log(err.response);
    showAlert(err.response.data.message, 'error');
  }
}
