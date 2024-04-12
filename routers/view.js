const express = require('express');
const viewControllers = require('./../controllers/viewControllers');
const authControllers = require('./../controllers/authController');

const view = express.Router();

view.get('/logout', viewControllers.checkLogin, viewControllers.logOut);
view.get('/login', viewControllers.getLogin);
view.get('/signup', viewControllers.getSignUp);
view.get('/confirmSigningUp/:uniqueToken', viewControllers.confirmSigningUp);
view.get('/overview', viewControllers.checkLogin, viewControllers.getOverview);
view.get(
  '/tour/:slug',
  viewControllers.checkLogin,
  viewControllers.getTourOverview
);
view.get(
  '/profile/info',
  authControllers.protectRoute,
  viewControllers.getProfile
);

module.exports = view;
