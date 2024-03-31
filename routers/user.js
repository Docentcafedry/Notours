const express = require('express');
const authControllers = require('./../controllers/authController');
const userControllers = require('./../controllers/userControllers');

const user = express.Router();

user.post('/recoverPassword', authControllers.recoverPassword);
user.post('/resetPassword/:recoverToken', authControllers.resetPassword);
user.post(
  '/changePassword',
  authControllers.protectRoute,
  userControllers.changePassword
);
user.patch(
  '/changeUserInfo',
  authControllers.protectRoute,
  userControllers.changeUserInfo
);
user.delete(
  '/deleteAccount',
  authControllers.protectRoute,
  userControllers.deleteAccount
);
user.route('/signup').post(authControllers.signUp);
user.route('/signin').post(authControllers.signIn);
user.route('/').get(authControllers.protectRoute, userControllers.getUsers);

module.exports = user;
