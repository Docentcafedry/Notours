const User = require('../models/userModel');
const errorCatch = require('../utils/error-catching');
const AppError = require('../utils/app-error');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendMail = require('./../utils/email-sender');
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
  console.log(hashedToken);
  const user = await User.findOne({
    passwordRecoveryToken: hashedToken,
  }).select('+passwordRecoveryTime');

  if (!user) {
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

  if (!user) {
    next(new AppError('There is no such user with this email'));
  }

  const uniqueToken = crypto.randomBytes(48).toString('hex');

  await user.setPasswordRecovery(uniqueToken);

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://127.0.0.1${req.originalUrl}/${uniqueToken}`;
  const mailOptions = {
    sender: '"Alex Foo Koch 👻" <docent@ethereal.email>',
    recipient: userEmail,
    subject: 'Password recovery',
    text: `Hello, ${user.name}!. Your link for password recovery: ${resetUrl}\nIf you didn't invoke password recovery just ignore this message `,
  };

  await sendMail(mailOptions);

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
  const { id: userId, iat } = payload;
  console.log(userId);
  const user = await User.findOne({ _id: userId }).select('+role');
  if (!user) {
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
    console.log(userRole);
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

  const token = jwt.sign({ id: user._id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: '1h',
  });

  return res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: user,
    },
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

  const token = jwt.sign({ id: user._id }, process.env.JWT_PRIVATE_KEY, {
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
