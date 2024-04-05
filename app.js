const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const tourRoute = require(`./routers/tour`);
const userRoute = require('./routers/user');
const viewRoute = require('./routers/view');
const reviewRoute = require('./routers/review');
const mongoose = require('mongoose');
const AppError = require('./utils/app-error');
const errorHandler = require('./controllers/errorController');
const expressSanitizer = require('express-sanitizer');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

dotenv.config({ path: './config.env' });

const app = express();

app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

mongoose
  .connect(process.env.DATABASE_LOCAL, {})
  .then((con) => {
    console.log('Successfull connection');
  })
  .catch((err) => {
    console.log('Something went wrong during connection to db');
  });

app.use(helmet());

app.use(hpp());

app.use(mongoSanitize());

if (process.env.DEV_STATUS === 'DEVELOPMENT') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use(expressSanitizer());

app.use((req, res, next) => {
  console.log('Hello from custom middleware😉');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString;
  next();
});

// app.get('/', (req, res) => {
//   return res.status(200).render('base', {
//     title: 'Overview',
//   });
// });

// app.get('/overview', (req, res) => {
//   return res.status(200).render('overview', {
//     title: 'Overview',
//   });
// });
app.use('/', viewRoute);
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);

app.all('*', (req, res, next) => {
  const error = new AppError('There is no such path in app', 400);

  next(error);
});

app.use(errorHandler);

app.listen(5555, () => {
  console.log('Started listening port 5555');
});
