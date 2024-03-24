const mongoose = require('mongoose');
const slugify = require('slugify');
const tour = require('../routers/tour');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name must be provided!'],
      unique: true,
    },
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.virtual('weekDuration').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { replacement: '_', lower: true, trim: true });
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
