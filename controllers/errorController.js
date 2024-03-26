function devErrorHandler(err, res) {
  return res.status(err.statusCode || 400).json({
    message: err.message,
    status: err.status,
    stack: err.stack,
  });
}

function prodErrorHandler(err, res) {
  if (err.isAppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: err.status,
    });
  } else {
    if (err.name === 'CastError') {
      return res.status(404).json({
        message: `Invalid id format: ${err.value} `,
        status: 'failed',
      });
    }
    if (err.name === 'MongoServerError') {
      const quotesValue = err.message.match(/"((?:\\.|[^"\\])*)"/);
      console.log(quotesValue);
      return res.status(400).json({
        message: `Tour with name '${quotesValue[1]}' already exists`,
        status: 'failed',
      });
    }
    if (err.name === 'ValidationError') {
      const message = Object.keys(err.errors)
        .map((key) => err.errors[key].properties.message)
        .join(' ');
      return res.status(400).json({
        message,
        status: 'failed',
      });
    } else {
      return res.status(500).json({
        message: 'Something went wrong',
        status: 'Error',
      });
    }
  }
}

function errorHandler(err, req, res, next) {
  if (process.env.DEV_STATUS === 'DEVELOPMENT') {
    devErrorHandler(err, res);
  } else {
    prodErrorHandler(err, res);
  }
}

module.exports = errorHandler;
