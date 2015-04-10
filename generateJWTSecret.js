var crypto = require('crypto'),
  fs = require('fs');

var filename = './server/config/env.json',
  value = new Buffer(crypto.randomBytes(128)),
  secret = value.toString('hex');

var json = JSON.stringify({ "jwtSecret": secret });

fs.writeFile(filename, json, function(err) {
  if (err) return console.log("Couldn't save JWT secret!");

  console.log('JWT secret was successfully created!');
});
