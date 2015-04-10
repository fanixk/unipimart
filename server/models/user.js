var _ = require('lodash'),
  Sequelize = require('sequelize'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  db = require('../config/db.js'),
  config = require('../config/env.json'),
  TOKEN_EXPIRATION = 60;


var mockedUser = {
  id: 1,
  email: 'test@test.com',
  password: '123'
};

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
    beforeCreate: function(user, options, fn) {
      bcrypt.hash(user.password, 10, function(err, hash) {
        if(err) {
          fn(new Error('Account couldn\'t be registered.'));
        }
        user.password = hash;
        fn(null, user);
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

    User.findOne({ where: { email: email }})
      .then(function(user) {
        bcrypt.compare(password, user.password, function(err, isMatch) {
          if (err || !isMatch) {
            return respondInvalidUser(res);
          }
          var token = generateToken(user);
          return res.json({
            token: token
          })
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
        message: 'Passwords don\'t match'
      });
    }

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

      res.json({ token: generateToken(user.id) });
    });
  }
}
