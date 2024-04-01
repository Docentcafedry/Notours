const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./../models/userModel');
const tour = require('../routers/tour');

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
    startDates: [Date],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    startPosition: {
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

tourSchema.virtual('weekDuration').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { replacement: '_', lower: true, trim: true });
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
  this.find({ special: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -role -email' });
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { special: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
