const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL, {})
  .then((con) => {
    console.log('Successfull connection');
  })
  .catch((err) => {
    console.log('Something went wrong during connection to db');
  });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8')
);

const uploadData = async () => {
  try {
    await Tour.create(tours);
    console.log(`Successfully loaded ${tours.length} tours`);
  } catch (err) {
    console.log(err);
  }
};

const clearTours = async () => {
  try {
    await Tour.deleteMany();
    console.log('Successfully cleaned tours');
  } catch (err) {
    console.log(err);
  }
};

console.log(process.argv);

if (process.argv[2] === '--upload') {
  uploadData();
}

if (process.argv[2] === '--clear') {
  clearTours();
}
