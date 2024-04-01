const Review = require('./../models/reviewModel');
const errorCatch = require('./../utils/error-catching');

exports.getReviews = errorCatch(async (req, res, next) => {
  const reviews = await Review.find();

  return res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.createReview = errorCatch(async (req, res, next) => {
  const { body, rating, user, tour } = req.body;
  const newReview = await Review.create({ body, rating, user, tour });

  return res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
