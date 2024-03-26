const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const tourRoute = require(`./routers/tour`);
const mongoose = require('mongoose');
const AppError = require('./utils/app-error');
const errorHandler = require('./controllers/errorController');

dotenv.config({ path: './config.env' });

const app = express();

mongoose
  .connect(process.env.DATABASE_LOCAL, {})
  .then((con) => {
    console.log('Successfull connection');
  })
  .catch((err) => {
    console.log('Something went wrong during connection to db');
  });

app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from custom middleware😉');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString;
  next();
});

app.use('/api/v1/tours', tourRoute);

app.all('*', (req, res, next) => {
  const error = new AppError('There is no such path in app', 400);

  next(error);
});

app.use(errorHandler);

app.listen(5555, () => {
  console.log('Started listening port 5555');
});
