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

var User = mongoose.model('User', UserSchema);

module.exports = {User};