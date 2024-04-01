const mongoose = require('mongoose');
const express = require('express');
const reviewControllers = require('./../controllers/reviewControllers');
const authControllers = require('./../controllers/authController');

const review = express.Router();

review
  .route('/')
  .get(authControllers.protectRoute, reviewControllers.getReviews)
  .post(
    authControllers.protectRoute,
    authControllers.isAuthorized('user', 'admin', 'guide', 'lead-guide'),
    reviewControllers.createReview
  );

module.exports = review;
