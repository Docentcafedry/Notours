const { match } = require('assert');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/api-features');
const errorCatch = require('./../utils/error-catching');
const AppError = require('./../utils/app-error');
const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();

const filter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] !== 'image') {
    return cb(new AppError('You can upload only image for photo'), false);
  } else {
    return cb(null, true);
  }
};

exports.upload = multer({ storage: storage, fileFilter: filter }).fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  { name: 'images', maxCount: 3 },
]);

exports.resizeImage = errorCatch(async (req, res, next) => {
  if (!req.files.imageCover && !req.file.images) {
    return next();
  }

  // console.log(req.files);
  console.log(req.files.imageCover[0]);
  if (req.files.imageCover) {
    req.body.imageCover = `${
      req.files.imageCover[0].originalname.split('.')[0]
    }-${Date.now()}.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(300, 300)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.body.imageCover}`);
  }

  if (req.files.images) {
    req.body.images = [];
    const imgPromises = req.files.images.map(async (file, i) => {
      const imgName = `${
        file.originalname.split('.')[0]
      }-${Date.now()}-${i}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${imgName}`);
      req.body.images.push(imgName);
    });

    await Promise.all(imgPromises);
  }

  next();
});

exports.getHigherPrice = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = 'price';
  req.query.fields = 'name,duration,price';
  next();
};

exports.getToursWithIn = errorCatch(async (req, res, next) => {
  const withInNumber = req.params.distance;
  const [lat, lng] = req.params.pickedPosition.split(',');
  const withInNumberByMeasuring =
    req.params.unit === 'mls' ? withInNumber / 3963 : withInNumber / 6371;
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], withInNumberByMeasuring] },
    },
  });
  return res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.getToursNearPosition = errorCatch(async (req, res, next) => {
  const [lat, lng] = req.params.position.split(',');

  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceMultiplier: req.params.unit === 'mls' ? 1 / 1609.34 : 1 / 621,
        distanceField: 'distanceFromYou',
        spherical: true,
      },
    },
    {
      $project: { name: 1, duration: 1, distanceFromYou: 1 },
    },
    { $addFields: { distanceFromYou: { $round: ['$distanceFromYou', 0] } } },
  ]);

  return res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours: tours,
    },
  });
});

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

  // if (!tour) {
  //   const error = new AppError(
  //     `There is no tour with such id ${req.params.id}`,
  //     400
  //   );
  //   next(error);
  // }
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
