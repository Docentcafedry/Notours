const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
  role: {
    type: String,

    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: "User role can be as: user, guide, 'lead-guide, admin",
    },
    select: false,
  },
  passwordRecoveryToken: {
    type: String,
    select: false,
  },
  passwordRecoveryTime: {
    type: Date,
    select: false,
  },
  passwordChanged: {
    type: Date,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.$isNew) return next();

  this.passwordChanged = Date.now();
  next();
});

userSchema.methods.comparePasswords = async function (password, hashPassword) {
  return await bcrypt.compare(password, hashPassword);
};

userSchema.methods.setPasswordRecovery = async function (recoveryToken) {
  this.passwordRecoveryToken = crypto
    .createHash('sha256')
    .update(recoveryToken)
    .digest('hex');
  this.passwordRecoveryTime = Date.now();

  console.log(this.passwordRecoveryToken, this.passwordRecoveryTime);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChanged) {
    const passwordChangeTimestamp = parseInt(
      this.passwordChanged.getTime() / 1000,
      10
    );
    return passwordChangeTimestamp > JWTTimestamp;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
