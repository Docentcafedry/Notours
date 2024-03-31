const User = require('../models/userModel');
const errorCatch = require('../utils/error-catching');
const AppError = require('../utils/app-error');
const jwt = require('jsonwebtoken');
const filterObjectForUpdate = require('./../utils/filter-object');

exports.changePassword = errorCatch(async (req, res, next) => {
  if (!req.body.currentPassword) {
    next(new AppError('Provide current password', 400));
  }

  if (!req.body.password || !req.body.confirmPassword) {
    next(new AppError('Provide new password and confirm it', 400));
  }

  const userId = req.user.id;
  const user = await User.findOne({ _id: userId }).select('+password');
  if (!user.comparePasswords(req.body.currentPassword, user.password)) {
    next(new AppError('Invalid current password', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: '1h',
  });

  return res.status(200).json({
    status: 'success',
    token,
  });
});

exports.getUsers = errorCatch(async (req, res, next) => {
  const users = await User.find();

  return res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    result: users.length,
    data: {
      tours: users,
    },
  });
});

exports.changeUserInfo = errorCatch(async (req, res, next) => {
  const userId = req.user.id;
  if (!req.body) {
    next(new AppError('Provide fields to update', 400));
  }
  const fieldsToUpdate = filterObjectForUpdate(req.body, 'name', 'email');
  const user = await User.findOneAndUpdate({ _id: userId }, fieldsToUpdate, {
    new: true,
  });

  if (!user) {
    next(new AppError('There is no such user', 400));
  }

  return res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteAccount = errorCatch(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { active: false },
    { new: true }
  );

  if (!user) {
    next(new AppError('There is no such user', 400));
  }

  return res.status(204).json({
    status: 'success',
  });
});
