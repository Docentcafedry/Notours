const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, 'You should provide text for a review'],
    minlength: 5,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Review should be provided with rating'],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
  },
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
