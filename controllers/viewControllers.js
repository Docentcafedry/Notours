const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/api-features');
const errorCatch = require('./../utils/error-catching');
const AppError = require('./../utils/app-error');

exports.getOverview = errorCatch(async (req, res, next) => {
  const apiFeature = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const tours = await apiFeature.query;

  return res.status(200).render('overview', {
    title: 'Overview',
    tours: tours,
  });
});

exports.getTourOverview = errorCatch(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug });
  if (!tour) {
    return res.status(400).render('errorTemplate');
  }

  return res.status(200).render('tour_overview', {
    title: tour.name,
    tour: tour,
  });
});

exports.getLogin = (req, res) => {
  return res.status(200).render('login', {
    title: 'Login',
  });
};
