var express = require('express'),
  forceSSL = require('express-force-ssl'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  http = require('http'),
  https = require('https'),
  jwtMiddleware = require('express-jwt'),
  routes = require('./server/routes'),
  config = require('./server/config/env.json'),
  notFoundError = require('./server/errors/notFoundError');

var credentials = {
  key: fs.readFileSync('./server/config/ssl/key.pem'),
  cert: fs.readFileSync('./server/config/ssl/cert.pem')
};

var app = express();

app.use(forceSSL);
app.use(express.static(__dirname + '/client'));
// only accepts content-type application/json
app.use(bodyParser.json());

// Auth Middleware
// routes starting with /api will be checked for jwt token (except /api/login)
// app.all('/api/*', [require('./server/middlewares/authRequest')]);
app.use('/api/*', jwtMiddleware({ secret: config.jwtSecret}).unless({path: ['/api/login', '/api/register']}));

app.use(routes);

//return 404 on not matched routes
app.all('*', function(req, res, next) {
  next(new notFoundError('404'));
});

// error handler
app.use(function(err, req, res, next) {
  var code, msg; //default http 500

  switch (err.name) {
  case 'UnauthorizedError':
    code = err.status;
    msg = { message: 'Unauthorized' };
    break;
  case 'NotFoundError':
    code = err.status;
    msg = { message: 'Not Found' };
    break;
  case 'BadRequestError':
    code = err.status;
    msg = err.inner;
    break;
  default:
    // code = 500
    // msg = { message: "Internal Server Error" }; //default http 500
    code = err.status; //for debugging purposes only (Remove me!)
    msg = err.inner;   //
  }

  res.status(code).json(msg);
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

