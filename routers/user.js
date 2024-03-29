const express = require('express');
const authControllers = require('./../controllers/authController');
const userControllers = require('./../controllers/userControllers');

const user = express.Router();

user.route('/signup').post(authControllers.signUp);
user.route('/signin').post(authControllers.signIn);
user.route('/').get(authControllers.protectRoute, userControllers.getUsers);

module.exports = user;
