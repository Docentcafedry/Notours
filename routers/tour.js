const express = require('express');
const tourControllers = require(`./../controllers/tourConctrollers.js`);
const authControllers = require('./../controllers/authController');
const reviewsRouter = require('./review.js');

const tour = express.Router();

tour.use('/:id/reviews', reviewsRouter);

tour
  .route(
    '/tours-within/distance/:distance/picked-position/:pickedPosition/unit/:unit'
  )
  .get(tourControllers.getToursWithIn);

tour
  .route('/tours-near-position/position/:position/unit/:unit')
  .get(tourControllers.getToursNearPosition);

tour
  .route('/top-price')
  .get(tourControllers.getHigherPrice, tourControllers.getAllTours);

tour.route('/statistics').get(tourControllers.getStats);

tour.route('/mounthly-plan/:year').get(tourControllers.getYearTours);

tour.route('/').get(tourControllers.getAllTours).post(tourControllers.postTour);

tour
  .route('/:id')
  .patch(
    authControllers.protectRoute,
    authControllers.isAuthorized('lead-guide', 'admin'),
    tourControllers.changeTour
  )
  .get(tourControllers.getTour)
  .delete(
    authControllers.protectRoute,
    authControllers.isAuthorized('lead-guide', 'admin'),
    tourControllers.deleteTour
  );

module.exports = tour;
