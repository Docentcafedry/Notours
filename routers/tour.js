const express = require('express');
const tourControllers = require(`./../controllers/tourConctrollers.js`);

const tour = express.Router();

tour
  .route('/top-price')
  .get(tourControllers.getHigherPrice, tourControllers.getAllTours);

tour.route('/statistics').get(tourControllers.getStats);

tour.route('/mounthly-plan/:year').get(tourControllers.getYearTours);

tour.route('/').get(tourControllers.getAllTours).post(tourControllers.postTour);

tour
  .route('/:id')
  .patch(tourControllers.changeTour)
  .get(tourControllers.getTour)
  .delete(tourControllers.deleteTour);

module.exports = tour;
