const Tour = require('./../models/tourModel');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/api-features');
const errorCatch = require('./../utils/error-catching');
const AppError = require('./../utils/app-error');

exports.checkLogin = async (req, res, next) => {
  try {
    const authCookie = req.cookies.jwt;
    if (!authCookie) {
      return next();
    }

    const payload = await jwt.verify(
      req.cookies.jwt,
      process.env.JWT_PRIVATE_KEY
    );
    const { id: userId, iat } = payload;
    console.log(userId);
    const user = await User.findOne({ _id: userId }).select('+role');
    if (!user) {
      return next();
    }

    if (user.passwordChangedAfter(iat)) {
      return next();
    }

    res.locals.user = user;
    next();
  } catch (err) {
    next();
  }
};

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
    return next(new AppError('Tour not found', 404));
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

exports.logOut = errorCatch(async (req, res) => {
  res.cookie('jwt', 'jwt');

  return res.status(200).json({
    status: 'success',
  });
});
