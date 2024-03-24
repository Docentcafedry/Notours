const { match } = require('assert');
const Tour = require('./../models/tourModel');
const fs = require('fs');
const APIFeatures = require('./../utils/api-features');

// exports.validateBodyTour = validateBodyTour = (req, res, next) => {
//   if (!req.body.name || !req.body.duration) {
//     return res.status(400).json({
//       status: 'error',
//       description: 'you should provide name and duration of a tour',
//     });
//   }
//   next();
// };

exports.getHigherPrice = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = 'price';
  req.query.fields = 'name,duration,price';
  next();
};

exports.getYearTours = async (req, res) => {
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
};

exports.getStats = async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      status: 'error',
      description: err,
    });
  }
};

exports.getAllTours = getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      description: err,
    });
  }
};

exports.postTour = postTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    return res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      description: err,
    });
  }
};

exports.getTour = getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    return res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      description: err,
    });
  }
};

exports.changeTour = changeTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      description: err,
    });
  }
};

exports.deleteTour = deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      description: err,
    });
  }
};
