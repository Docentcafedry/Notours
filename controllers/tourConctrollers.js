const { match } = require('assert');
const Tour = require('./../models/tourModel');
const fs = require('fs');
const APIFeatures = require('./../utils/api-features');
const errorCatch = require('./../utils/error-catching');
const AppError = require('./../utils/app-error');

exports.getHigherPrice = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = 'price';
  req.query.fields = 'name,duration,price';
  next();
};

exports.getYearTours = errorCatch(async (req, res) => {
  const year = req.params.year;
  try {
    const tours = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01}`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          countOfTours: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
    ]);
    return res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      data: {
        stats: tours,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      status: 'error',
      description: err,
    });
  }
});

exports.getStats = errorCatch(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
    { $addFields: { difficulty: '$_id' } },

    { $project: { _id: 0 } },
    { $sort: { avgPrice: 1 } },
  ]);
  return res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    data: {
      stats: stats,
    },
  });
});

exports.getAllTours = errorCatch(async (req, res) => {
  const apiFeature = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const tours = await apiFeature.query;

  return res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    result: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.postTour = postTour = errorCatch(async (req, res) => {
  const newTour = await Tour.create(req.body);

  return res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getTour = getTour = errorCatch(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    const error = new AppError(
      `There is no tour with such id ${req.params.id}`,
      400
    );
    next(error);
  }
  return res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.changeTour = changeTour = errorCatch(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    const error = new AppError(
      `There is no tour with such id ${req.params.id}`,
      400
    );
    next(error);
  }

  return res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.deleteTour = deleteTour = errorCatch(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    const error = new AppError(
      `There is no tour with such id ${req.params.id}`,
      400
    );
    next(error);
  }

  return res.status(204).json({
    status: 'success',
    data: null,
  });
});
