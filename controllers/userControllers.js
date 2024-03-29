const User = require('../models/userModel');
const errorCatch = require('../utils/error-catching');
const AppError = require('../utils/app-error');

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
