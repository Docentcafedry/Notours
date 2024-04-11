const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const errorCatch = require('../utils/error-catching');
const AppError = require('../utils/app-error');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');

exports.getCheckoutSession = errorCatch(async (req, res, next) => {
  const tourId = req.params.tourId;
  const tourDate = req.params.tourDate;
  console.log(tourDate);

  const tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('There is no such tour', 404));
  }

  let placesLeftForPickedDate;

  tour.startDates.forEach((el) => {
    if (el.date.toISOString() === tourDate) {
      placesLeftForPickedDate = el.placesLeft;
    }
  });

  if (!placesLeftForPickedDate) {
    return next(
      new AppError('There is no free places for the picked date', 400)
    );
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tour.name,
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    client_reference_id: tourId,
    // customer: req.user.email,
    success_url: `${req.protocol}://${req.get('host')}/overview?tourId=${
      tour._id
    }&userId=${req.user.id}&price=${tour.price}&tourDate=${tourDate}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    mode: 'payment',
    currency: 'usd',
    payment_method_types: ['card'],
    customer_email: req.user.email,
  });

  return res.status(200).json({
    status: 'success',
    session,
  });
});

exports.getAllBookings = errorCatch(async (req, res, next) => {
  let query;
  if (req.params.tourId) {
    query = Booking.find({
      tour: req.params.tourId,
    });
  }

  if (req.params.userId) {
    query = Booking.find({
      user: req.params.userId,
    });
  }
  if (!req.params.tourId && !req.params.userId) {
    query = Booking.find();
  }
  const bookings = await query;

  return res.status(200).json({
    status: 'success',
    bookings,
  });
});

exports.getBooking = errorCatch(async (req, res, next) => {
  let query;
  if (req.params.tourId) {
    query = Booking.find({
      _id: req.params.bookingId,
      tour: req.params.tourId,
    });
  }

  if (req.params.userId) {
    query = Booking.find({
      user: req.params.userId,
    });
  }

  if (!req.params.tourId && !req.params.userId) {
    query = Booking.findById(req.params.bookingId);
  }
  const booking = await query;
  if (!booking) {
    return next(new AppError('There is no such booking', 400));
  }

  return res.status(200).json({
    status: 'success',
    booking,
  });
});

exports.changeBooking = errorCatch(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.bookingId,
    req.body,
    { new: true }
  );
  if (!booking) {
    return next(new AppError('There is no such booking', 400));
  }

  return res.status(200).json({
    status: 'success',
    booking,
  });
});

exports.createBooking = errorCatch(async (req, res) => {
  const { user, tour, price } = req.body;
  const newBooking = await Booking.create({ user, tour, price });

  return res.status(201).json({
    status: 'success',
    newBooking,
  });
});

exports.deleteBooking = errorCatch(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.bookingId);
  if (!booking) {
    return next(new AppError('There is no such booking', 400));
  }

  return res.status(204).json({
    status: 'success',
  });
});
