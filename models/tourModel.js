const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./../models/userModel');
const tour = require('../routers/tour');

const dateInfoSchema = new mongoose.Schema({
  date: { type: Date },
  placesLeft: { type: Number },
});

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name must be provided!'],
      unique: true,
      minlength: 5,
      maxlength: 31,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Duration must be provided'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Group size for the tour must be provided'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty must be provided'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty must be provided with next options: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 4,
    },
    price: {
      type: Number,
      required: [true, 'Price must be provided!'],
      min: 1,
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          return this.price > val;
        },
        message: 'Discount must be less than current price',
      },
    },
    creationDate: {
      type: Date,
      default: Date.now(),
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Summary must be provided'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Description must be provided'],
    },
    imageCover: {
      type: String,
      required: [true, 'Image cover must be provided'],
    },
    images: [String],
    startDates: [dateInfoSchema],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('weekDuration').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});

tourSchema.pre('save', function (next) {
  if (this.$isNew) {
    this.slug = slugify(this.name, {
      replacement: '_',
      lower: true,
      trim: true,
    });

    this.startDates.forEach((el) => (el.placesLeft = this.maxGroupSize));
  }
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guides = this.guides.map(async (userId) => await User.findById(userId));
//   const user = await User.findById(this.guides[0]);
//   console.log(user);

//   this.guides = await Promise.all(guides);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ special: { $ne: true } }).populate({ path: 'reviews' });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -email' });
  next();
});

tourSchema.pre('aggregate', function (next) {
  if (this.pipeline()[0].$geoNear) {
    this.pipeline()[-1] = { $match: { special: { $ne: true } } };
    next();
  } else {
    this.pipeline().unshift({ $match: { special: { $ne: true } } });
    next();
  }
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
