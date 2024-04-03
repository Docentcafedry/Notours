const mongoose = require('mongoose');
const express = require('express');
const Review = require('./../models/reviewModel');
const reviewControllers = require('./../controllers/reviewControllers');
const authControllers = require('./../controllers/authController');
const handlerFactory = require('./../controllers/handlerFactory');

const review = express.Router({ mergeParams: true });

review
  .route('/')
  .get(authControllers.protectRoute, reviewControllers.getReviews)
  .post(
    authControllers.protectRoute,
    authControllers.isAuthorized('user', 'admin', 'guide', 'lead-guide'),
    reviewControllers.getUserIdAndTourId,
    reviewControllers.createReview
  );

review
  .route('/:id')
  .get(handlerFactory.getOne(Review))
  .patch(
    authControllers.protectRoute,
    authControllers.isAuthorized('admin'),
    handlerFactory.changeOne(Review)
  )
  .delete(
    authControllers.protectRoute,
    authControllers.isAuthorized('admin'),
    handlerFactory.deleteOne(Review)
  );

module.exports = review;
