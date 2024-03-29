const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User mast have a name!'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Use must have an email'],
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Invalid email address',
    },
  },
  password: {
    type: String,
    required: [true, "You shoulld provide user's password"],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "You must confirm your user's password"],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Passwords didn't matched",
    },
  },
  passwordChanged: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.comparePasswords = async function (password, hashPassword) {
  return await bcrypt.compare(password, hashPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChanged) {
    const passwordChangeTimestamp = parseInt(
      this.passwordChanged.getTime() / 1000,
      10
    );
    return passwordChangeTimestamp < JWTTimestamp;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
