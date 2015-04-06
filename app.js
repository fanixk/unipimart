var express = require('express'),
  forceSSL = require('express-force-ssl'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  http = require('http'),
  https = require('https');

var credentials = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};

var app = express();

app.use(forceSSL);
app.use(express.static(__dirname + '/client'));
app.use(bodyParser.json());

// Auth Middleware
// routes starting with /api will be checked for jwt token
// app.all('/api/*', [require('./server/middlewares/authRequest')]);

app.use('/', require('./server/routes'));

// no routes matched return 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.set('httpsPort', process.env.httpsPort || 8443);
app.set('port', process.env.PORT || 8000);

// Start the server
var secureServer = https.createServer(credentials, app).listen(app.get('httpsPort'), function() {
  console.log('Express secure server listening on port ' + secureServer.address().port);
});

var server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});;

