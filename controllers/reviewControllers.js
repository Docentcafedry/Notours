const Review = require('./../models/reviewModel');
const errorCatch = require('./../utils/error-catching');

exports.getUserIdAndTourId = errorCatch(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.id;

  next();
});

exports.getReviews = errorCatch(async (req, res, next) => {
  let filter = {};

  if (req.params.id) {
    filter.tour = req.params.id;
  }

  const reviews = await Review.find(filter);

  return res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.createReview = errorCatch(async (req, res, next) => {
  const { review, rating, user, tour } = req.body;
  const newReview = await Review.create({ review, rating, user, tour });

  return res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
