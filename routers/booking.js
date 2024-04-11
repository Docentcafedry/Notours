const express = require('express');
const bookingControllers = require('./../controllers/bookingControllers');
const authControllers = require('./../controllers/authController');

const booking = express.Router({ mergeParams: true });

booking.get(
  '/checkout-session/:tourId/:tourDate',
  authControllers.protectRoute,
  bookingControllers.getCheckoutSession
);

booking.use(
  authControllers.protectRoute,
  authControllers.isAuthorized('admin', 'lead-guide')
);

booking
  .route('/')
  .get(bookingControllers.getAllBookings)
  .post(bookingControllers.createBooking);

booking
  .route('/bookingId')
  .get(bookingControllers.getBooking)
  .patch(bookingControllers.changeBooking)
  .delete(bookingControllers.deleteBooking);

module.exports = booking;
