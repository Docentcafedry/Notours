const express = require('express');
const viewControllers = require('./../controllers/viewControllers');

const view = express.Router();

view.get('/logout', viewControllers.checkLogin, viewControllers.logOut);
view.get('/login', viewControllers.getLogin);
view.get('/overview', viewControllers.checkLogin, viewControllers.getOverview);
view.get('/:slug', viewControllers.checkLogin, viewControllers.getTourOverview);

module.exports = view;
