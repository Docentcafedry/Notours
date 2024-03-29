const User = require('../models/userModel');
const errorCatch = require('../utils/error-catching');
const AppError = require('../utils/app-error');
const jwt = require('jsonwebtoken');
const { json } = require('express');

exports.protectRoute = errorCatch(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    next(new AppError('Authorization info not provided '));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    next(new AppError('Token is not provided'));
  }

  const payload = await jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  const { id: userId, iat } = payload;
  const user = await User.findOne({ userId });
  if (!user) {
    next(new AppError('There is no such user'));
  }

  if (user.passwordChangedAfter()) {
    next(new AppError('Provided token expired'));
  }

  next();
});

exports.signUp = errorCatch(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const user = await User.create({ name, email, password, confirmPassword });

  const token = jwt.sign({ id: user._id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
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
    next(new AppError('There is no such user', 401));
  }

  const validPassword = await user.comparePasswords(password, user.password);

  if (!validPassword) {
    next(new AppError('Bad credentials', 401));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res.status(201).json({
    status: 'success',
    user_id: user._id,
    token: token,
  });
});
