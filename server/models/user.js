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
  res.status(200)
    .json({
      "message": "Invalid email and/or password."
    });
}

module.exports = {
  login: function(req, res, next) {

    var email = req.body.email,
      password = req.body.password;

    if(_.isEmpty(email) || _.isEmpty(password)) {
      respondInvalidUser(res);
      return;
    }

    console.log(email == mockedUser.email);
    console.log(password == mockedUser.password);

    //spoof db call for now
    if(email == mockedUser.email && password == mockedUser.password) {
      var token = jwt.sign({ id: mockedUser.id }, config.jwtSecret, { expiresInMinutes: TOKEN_EXPIRATION });
      return res.json({ token: token });
    }
    
    return respondInvalidUser(res);
    // bcrypt.compare(mockedUser.password, password, function (err, isMatch) {
    //     if (err) {
    //         return respondInvalidUser(res);
    //     }
    //     return respondValidUser(res, user);
    // });

  }
}
