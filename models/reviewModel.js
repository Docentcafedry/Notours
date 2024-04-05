const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
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
      required: [true, 'You should provide a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'You should provide a tour'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.statics.getAverageStat = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        ratingNum: { $sum: 1 },
        ratingAvg: { $avg: '$rating' },
      },
    },
  ]);

  if (stats) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].ratingAvg,
      ratingQuantity: stats[0].ratingNum,
    });
  } else {
    await Tour.findByIdAndUpdate(this.tour, {
      ratingsAverage: 0,
      ratingQuantity: 4.5,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.getAverageStat(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.getAverageStat(this.r.tour);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
