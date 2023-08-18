const mongoose = require('mongoose');

const { Schema } = mongoose;
mongoose.Promise = global.Promise;
const validator = require('validator');
const passportLocalMongoose = require('passport-local-mongoose');
const md5 = require('md5');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please Supply an email address',
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true,
  },

  number: {
    type: Number,
    required: true,
    trim: true,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },
  access: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  wishlist: {
    type: Array,
    default: [],
  },
  wallet: {
    type: Number,
    default: 0,
  },
  otpToken: String,
  tokenExpires: Date,
});

userSchema.virtual('gravatar').get(function () {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  findByUsername: (User, email) => User.findOne(email),
});

module.exports = mongoose.model('User', userSchema);
