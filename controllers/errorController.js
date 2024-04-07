function devErrorHandler(req, err, res) {
  if (req.originalUrl.startsWith('/api/v1')) {
    return res.status(err.statusCode || 400).json({
      message: err.message,
      status: err.status,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode || 400).render('errorTemplate', {
    title: req.originalUrl.slice(1),
    message: err.message,
    stack: err.stack,
  });
}

function prodErrorHandler(req, err, res) {
  if (err.isAppError) {
    if (req.originalUrl.startsWith('/api/v1')) {
      return res.status(err.statusCode).json({
        message: err.message,
        status: err.status,
      });
    }
    return res.status(err.statusCode || 400).render('errorTemplate', {
      title: req.originalUrl.slice(1),
      message: err.message,
    });
  } else {
    if (req.originalUrl.startsWith('/api/v1')) {
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
    } else {
      return res.status(err.statusCode || 400).render('errorTemplate', {
        title: req.originalUrl.slice(1),
        message: 'Something went wrong',
      });
    }
  }
}

function errorHandler(err, req, res, next) {
  if (process.env.DEV_STATUS === 'DEVELOPMENT') {
    devErrorHandler(req, err, res);
  } else {
    prodErrorHandler(req, err, res);
  }
}

module.exports = errorHandler;
