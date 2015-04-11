'use strict';

var _ = require('lodash'),
  Sequelize = require('sequelize'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  sanitizer = require('sanitizer'),
  isEmail = require('isemail'),
  db = require('../config/db.js'),
  config = require('../config/env.json');

var TOKEN_EXPIRATION = 60,
  MISSING_EMAIL_ERROR = 'Missing email.',
  MISSING_PASS_ERROR = 'Missing password.',
  MISSING_PASSCONFIRM_ERROR = 'Missing password confirmation.',
  PASS_LENGTH_ERROR = 'Password should be at least 8 characters long.',
  PASS_MATCH_ERROR = 'Passwords don\'t match.',
  INVALID_EMAIL_ERROR = 'Not a valid email address.',
  INVALID_USER_ERROR = 'Invalid email and/or password.',
  ACCOUNT_EXISTS_ERROR = 'Account with that email already exists.',
  ACCOUNT_CREATE_ERROR = 'Account couldn\'t be registered.';

var User = db.define('user', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    field: 'password_digest' // Will result in an attribute that is password when user facing but password_digest in the database
  }
}, {
  timestamps: false,
  hooks: {
    // hash the password before saving it in db
    beforeCreate: function(user, options, cb) {
      // bcrypt user pass
      bcrypt.hash(user.password, 10, function(err, hash) {
        if(err) {
          cb(new Error(ACCOUNT_CREATE_ERROR));
        }

        //set the hash to the user password
        user.password = hash;
        cb(null, user);
      });
    }
  }
});

function validateRegister(email, password, password_confirmation) {
  var errors = [],
    isValid = true;

  if (_.isEmpty(email)) {
    isValid = false;
    errors.push(MISSING_EMAIL_ERROR);
  }

  if (_.isEmpty(password)) {
    isValid = false;
    errors.push(MISSING_PASS_ERROR);
  }

  if (_.isEmpty(password_confirmation)) {
    isValid = false;
    errors.push(MISSING_PASSCONFIRM_ERROR);
  }

  if (password && password.length < 8) {
    isValid = false;
    errors.push(PASS_LENGTH_ERROR);
  }

  if (password && password_confirmation && (password_confirmation !== password)) {
    isValid = false;
    errors.push(PASS_MATCH_ERROR);
  }

  // RFCs 5321, 5322 compliant
  if (email && !isEmail(email)) {
    isValid = false;
    errors.push(INVALID_EMAIL_ERROR);
  }

  return {
    isValid: isValid,
    errors: errors
  };
}

function respondInvalidUser(res) {
  res.status(401)
    .json({
      errorMsg: INVALID_USER_ERROR
    });
}

function generateToken(user) {
  // payload is the user object except the password
  var payload = _.omit(user.toJSON(), 'password');
  var token = jwt.sign(payload, config.jwtSecret, { expiresInMinutes: TOKEN_EXPIRATION });
  return token;
}

module.exports = {
  login: function(req, res) {

    var email = req.body.email || '',
      password = req.body.password || '';

    if(_.isEmpty(email) || _.isEmpty(password)) {
      return respondInvalidUser(res);
    }

    // find user by email
    User.findOne({ where: { email: email }}).then(function(user) {
      // user does not exist
      if (!user) {
        return respondInvalidUser(res);
      }

      // compare hashed passwords
      bcrypt.compare(password, user.password, function(err, isMatch) {
        // on error or not matched hashed pwds
        if (err || !isMatch) {
          return respondInvalidUser(res);
        }

        // send generated token on valid auth
        var token = generateToken(user);
        return res.json({
          email: email,
          token: token
        });
      });
    });
  },
  register: function(req, res) {
    var email = req.body.email || '',
      password = req.body.password || '',
      password_confirmation = req.body.password_confirmation || '';

    // xss sanitize
    // even valid email addresses can be used for xss attacks
    email = sanitizer.sanitize(email);

    var validator = validateRegister(email, password, password_confirmation);
    
    if (!validator.isValid) {
      return res.status(400)
        .json({
          errors: validator.errors
        });
    }

    // find user by email
    // create user if he does not exist
    // return generated token
    User.findOrCreate({
      where: {
        email: email
      },
      defaults: {
        password: password
      }
    })
    .spread(function(user, created) {
      if(!created) {
        return res.json({
          errorMsg: ACCOUNT_EXISTS_ERROR
        });
      }

      res.json({ email: email, token: generateToken(user) });
    });
  }
}
