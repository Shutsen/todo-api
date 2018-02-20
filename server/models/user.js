const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    unique: true,
    validate: { 
      validator: validator.isEmail
      },
      message: '{VALUE} is not a valid email'
    },
    password: {
      required: true,
      type: String,
      minlength: 6
    },
    tokens: [{
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }]
});

//we only want to send specific properties from the user object, to avoid sensitive information being transferred
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

//we're using a regular function here because arrow function do not support the this keyword
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  //to avoid db inconsistency we use following way to push the access and token into the tokens array (instead of regular takens.push()
  user.tokens = user.tokens.concat([{access, token}]);
  
  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  // returning a Promise so we can chain it in server.js
  // keys are between quotes because of . notation (we're querying a nested object key), '_id' for consistency
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

var User = mongoose.model('User', UserSchema);

module.exports = {User};