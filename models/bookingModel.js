const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'You should provide tour for a booking!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'You should provide user for a booking!'],
  },
  price: {
    type: Number,
    required: [true, 'You should provide price for a booking!'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name price' });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
