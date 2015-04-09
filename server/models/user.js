var _ = require('lodash'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  config = require('../config/env.json'),
  TOKEN_EXPIRATION = 60;


var mockedUser = {
  id: 1,
  email: 'test@test.com',
  password: '123'
};

function respondInvalidUser(res) {
  res.status(404)
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

    //spoof db call for now
    if(email === mockedUser.email && password === mockedUser.password) {
      //default algorithm HS256 
      var token = generateToken(mockedUser);
      return res.json({ token: token });
    }
    
    return respondInvalidUser(res);
    // bcrypt.compare(password, mockedUser.password, function (err, isMatch) {
    //     if (err || !isMatch) {
    //         return respondInvalidUser(res);
    //     }
    //     return respondValidUser(res, user);
    // });

  },
  // register: function(req, res) {
  //   var email = req.body.email,
  //     password = req.body.password,
  //     password_confirmation = req.body.password_confirmation;

  //   if (_.isEmpty(email)) {
  //     return res.json({
  //         message: 'Missing email.'
  //       });
  //   }

  //   if (_.isEmpty(password)) {
  //     return res.json({
  //       message: 'Missing password.'
  //     });
  //   }

  //   if (password.length < 8) {
  //     return res.json({
  //       message: 'Password should be at least 8 characters long'
  //     });
  //   }

  //   if (password_confirmation !== password) {
  //     return res.json({
  //       message: 'Passwords don\'t match'
  //     });
  //   }

  //   // var userExists = db.find_by_email(email);
  //   var userExists = false;

  //   if(userExists) {
  //     return res.json({
  //       message: 'Account with that email already exists.'
  //     });
  //   }

  //   bcrypt.hash(password, 10, function(err, hash) {
  //     if (err) {
  //       return res.json({
  //         message: 'Account couldn\'t be registered.'
  //       });
  //     }

  //     // db.user.save(hash)
  //     return res.json({ token: generateToken(user) });
  //   });
  // }
}
