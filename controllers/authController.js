const User = require('../models/userModel');
const errorCatch = require('../utils/error-catching');
const AppError = require('../utils/app-error');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const EmailSender = require('./../utils/email-sender');
const bcrypt = require('bcrypt');
const { trusted } = require('mongoose');

exports.resetPassword = errorCatch(async (req, res, next) => {
  if (!req.body.password || !req.body.confirmPassword) {
    next(new AppError('You nedd to provide new password and confirm it'));
  }
  const recoverToken = req.params.recoverToken;
  const hashedToken = crypto
    .createHash('sha256')
    .update(recoverToken)
    .digest('hex');
  const user = await User.findOne({
    passwordRecoveryToken: hashedToken,
  }).select('+passwordRecoveryTime');

  if (!user || !user.active) {
    next(new AppError('There is no such user'));
  }

  const expirationTokenTime = user.passwordRecoveryTime + 1000 * 60 * 15;

  if (Date.now() > expirationTokenTime) {
    next(new AppError('Recover password token expired'));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordRecoveryToken = undefined;
  user.passwordRecoveryTime = undefined;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Successfully recovered and reseted passsword for user',
  });
});

exports.recoverPassword = errorCatch(async (req, res, next) => {
  const userEmail = req.body.email;
  const user = await User.findOne({ email: userEmail });

  if (!user || !user.active) {
    next(new AppError('There is no such user with this email'));
  }

  const uniqueToken = crypto.randomBytes(48).toString('hex');

  await user.setPasswordRecovery(uniqueToken);

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://127.0.0.1${req.originalUrl}/${uniqueToken}`;
  await new EmailSender(user, resetUrl).sendPasswordRecoveryMessage();

  res.status(200).json({
    status: 'success',
    message: 'Check your email for recovery link',
  });
});

exports.protectRoute = errorCatch(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  const cookieAuth = req.cookies.jwt;

  token = authHeader ? authHeader.split(' ')[1] : cookieAuth;

  if (!token) {
    next(new AppError('Token is not provided'));
  }

  const payload = await jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  const { id, iat } = payload;
  const user = await User.findOne({ _id: id }).select('+role');
  if (!user || !user.active) {
    next(new AppError('There is no such user'));
  }

  if (user.passwordChangedAfter(iat)) {
    next(new AppError('Provided token expired'));
  }

  req.user = user;
  res.locals.user = user;

  next();
});

exports.isAuthorized = (...fields) => {
  return errorCatch(async (req, resp, next) => {
    const userRole = req.user.role;

    if (!fields.includes(userRole)) {
      next(
        new AppError('You have no privilages for executing this operation', 403)
      );
    }
    next();
  });
};

exports.signUp = errorCatch(async (req, res, next) => {
  const { name, email, password, confirmPassword, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    role,
  });

  const uniqueToken = crypto.randomBytes(48).toString('hex');

  await user.setSignUpToken(uniqueToken);

  await user.save({ validateBeforeSave: false });

  let signUpUrl;

  if (req.route.path.startsWith('/signup')) {
    signUpUrl = `${req.protocol}://${req.get(
      'host'
    )}/confirmSigningUp/${uniqueToken}`;
  } else {
    signUpUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/confirmSigningUp/${uniqueToken}`;
  }
  await new EmailSender(user, signUpUrl).sendWelcomeMessage();

  return res.status(200).json({
    status: 'success',
    message: 'Check your email for an activation link!',
  });
});

exports.cofirmSigningUp = errorCatch(async (req, res, next) => {
  const uniqueToken = crypto
    .createHash('sha256')
    .update(req.params.uniqueToken)
    .digest('hex');

  const user = await User.find({ signUpToken: uniqueToken }).find({
    active: false,
  });
  console.log(user[0]);
  if (!user) {
    next(new AppError('There is no such user'));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: '1h',
  });

  res.cookie('jwt', token);

  user[0].active = true;
  user[0].signUpToken = undefined;
  await user[0].save({ validateBeforeSave: false });

  return res.status(200).json({
    status: 'succes',
    token,
  });
});

exports.signIn = errorCatch(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('There is no such user', 401));
  }

  const validPassword = await user.comparePasswords(password, user.password);

  if (!validPassword) {
    next(new AppError('Bad credentials', 401));
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: '1h',
  });

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 1000 * 60 * 60),
    httpOnly: true,
    secure: true,
  });

  return res.status(201).json({
    status: 'success',
    token: token,
  });
});
