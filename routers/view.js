const express = require('express');
const viewControllers = require('./../controllers/viewControllers');

const view = express.Router();

view.get('/overview', viewControllers.getOverview);
view.get('/:slug', viewControllers.getTourOverview);

module.exports = view;
