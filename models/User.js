const mongoose = require('mongoose');

const { Schema } = mongoose;
mongoose.Promise = global.Promise;
const validator = require('validator');
const passportLocalMongoose = require('passport-local-mongoose');

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
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  findByUsername: (User, email) => {
    email.access = true;
    email.isVerified = true;
    return User.findOne(email);
  },
});

module.exports = mongoose.model('User', userSchema);
