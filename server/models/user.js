var _ = require('lodash'),
  Sequelize = require('sequelize'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  sanitizer = require('sanitizer'),
  db = require('../config/db.js'),
  config = require('../config/env.json'),
  TOKEN_EXPIRATION = 60;

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
    beforeCreate: function(user, options, cb) {
      // bcrypt user pass
      bcrypt.hash(user.password, 10, function(err, hash) {
        if(err) {
          cb(new Error("Account couldn't be registered."));
        }

        //set the hash to the user password
        user.password = hash;
        cb(null, user);
      });
    }
  }
});

function respondInvalidUser(res) {
  res.status(401)
    .json({
      "message": "Invalid email and/or password."
    });
}

function generateToken(user) {
  var token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresInMinutes: TOKEN_EXPIRATION });
  return token;
}

module.exports = {
  login: function(req, res, next) {

    var email = req.body.email,
      password = req.body.password;

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
    var email = req.body.email,
      password = req.body.password,
      password_confirmation = req.body.password_confirmation;

    if (_.isEmpty(email)) {
      return res.json({
          message: 'Missing email.'
        });
    }

    if (_.isEmpty(password)) {
      return res.json({
        message: 'Missing password.'
      });
    }

    if (password.length < 8) {
      return res.json({
        message: 'Password should be at least 8 characters long'
      });
    }

    if (password_confirmation !== password) {
      return res.json({
        message: "Passwords don't match"
      });
    }

    // xss sanitize
    email = sanitizer.sanitize(email);

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
          message: 'Account with that email already exists.'
        });
      }

      res.json({ email: email, token: generateToken(user.id) });
    });
  }
}
