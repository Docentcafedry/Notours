const User = require('../models/userModel');
const errorCatch = require('../utils/error-catching');
const AppError = require('../utils/app-error');
const jwt = require('jsonwebtoken');

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
