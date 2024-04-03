const errorCatch = require('./../utils/error-catching');
const APIFeatures = require('./../utils/api-features');
const AppError = require('./../utils/app-error');

exports.getAll = (Model) =>
  errorCatch(async (req, res) => {
    const apiFeature = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .selectFields()
      .paginate();

    const doc = await apiFeature.query;

    return res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      result: doc.length,
      data: {
        tours: doc,
      },
    });
  });

exports.getOne = (Model) =>
  errorCatch(async (req, res, next) => {
    console.log(req.params.id);
    const doc = await Model.findById(req.params.id);

    return res.status(200).json({
      status: 'success',
      data: {
        doc: doc,
      },
    });
  });

exports.changeOne = (Model) =>
  errorCatch(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      const error = new AppError(
        `There is no doc with such id ${req.params.id}`,
        400
      );
      next(error);
    }

    return res.status(200).json({
      status: 'success',
      data: {
        doc: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  errorCatch(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      const error = new AppError(
        `There is no document with such id ${req.params.id}`,
        400
      );
      next(error);
    }

    return res.status(204).json({
      status: 'success',
      doc: null,
    });
  });
