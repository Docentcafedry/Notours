const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/api-features');
const errorCatch = require('./../utils/error-catching');
const AppError = require('./../utils/app-error');
const crypto = require('crypto');

exports.checkLogin = async (req, res, next) => {
  try {
    const authCookie = req.cookies.jwt;
    console.log(req.cookies.jwt);
    if (!authCookie) {
      return next();
    }

    const payload = await jwt.verify(
      req.cookies.jwt,
      process.env.JWT_PRIVATE_KEY
    );
    const { id, iat } = payload;
    const user = await User.findOne({ _id: id }).select('+role');
    if (!user || !user.active) {
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
  if (
    req.query.tourId &&
    req.query.userId &&
    req.query.price &&
    req.query.tourDate
  ) {
    const { tourId, userId, price } = req.query;
    await Booking.create({ tour: tourId, user: userId, price });

    const tour = await Tour.findById(tourId);

    tour.startDates.forEach((el) => {
      if (el.date.toISOString() === req.query.tourDate) {
        el.placesLeft = el.placesLeft - 1;
      }
    });

    await tour.save({ validateBeforeSave: false });
    return res.redirect('/overview');
  }

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

exports.getSignUp = (req, res) => {
  return res.status(200).render('signup', { title: 'Sign up' });
};

exports.logOut = errorCatch(async (req, res) => {
  res.cookie('jwt', 'jwt');

  return res.status(200).json({
    status: 'success',
  });
});

exports.getProfile = (req, res) => {
  return res.status(200).render('accountTemplate', {
    title: 'Account',
    user: req.user,
  });
};

exports.confirmSigningUp = errorCatch(async (req, res, next) => {
  const uniqueToken = crypto
    .createHash('sha256')
    .update(req.params.uniqueToken)
    .digest('hex');

  const user = await User.find({ signUpToken: uniqueToken }).find({
    active: false,
  });
  if (!user) {
    next(new AppError('There is no such user'));
  }

  const token = jwt.sign({ id: user[0].id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: '1h',
  });

  res.cookie('jwt', token);

  user[0].active = true;
  user[0].signUpToken = undefined;
  await user[0].save({ validateBeforeSave: false });

  return res.redirect(`/overview`);
});
