var express = require('express'),
  forceSSL = require('express-force-ssl'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  http = require('http'),
  https = require('https'),
  jwtMiddleware = require('express-jwt'),
  helmet = require('helmet'),
  routes = require('./server/routes'),
  config = require('./server/config/env.json'),
  notFoundError = require('./server/errors/notFoundError');

var credentials = {
  key: fs.readFileSync('./server/config/ssl/key.pem'),
  cert: fs.readFileSync('./server/config/ssl/cert.pem')
};

var app = express();

// Force use of https
app.use(forceSSL);

// Content Security Policy Header
// default Content security policy is to allow content loading only from same origin
// defaultSrc applies as a fallback to all sources not defined
app.use(helmet.csp({
  defaultSrc: ["'self'"],
  // scriptSrc: [],
  styleSrc: ["'self'", "'unsafe-inline'"], // permit inline css
  // imgSrc: [],
  // connectSrc: [],                      // ajax, web sockets
  // fontSrc: [],
  // objectSrc: [],                       // object, embed, applet
  // mediaSrc: [],                        // audio, video
  // frameSrc: []
}));

// Add X-XSS-Protection header
// X-XSS-Protection: 1; mode=block
// http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-iv-the-xss-filter.aspx
app.use(helmet.xssFilter());

// Implement header X-Frame-Options: Deny
// Deny - Does not allow your page to be served inside any frames.
// Prevents clickjacking attacks
app.use(helmet.frameguard('deny'));

// Implement Strict-Transport-Security header
// Response header -> Strict-Transport-Security: max-age=7776000; includeSubDomains
// HTTP Strict-Transport-Security (HSTS) enforces secure (HTTP over SSL/TLS) connections to the server. 
// This reduces impact of bugs in web applications leaking session data through cookies and external links 
// and defends against Man-in-the-middle attacks. 
// HSTS also disables the ability for user's to ignore SSL negotiation warnings.
// It basically tells user agents to interact with it in the future only over HTTPS.
app.use(helmet.hsts({
  maxAge: 7776000000,     // 90 days
  includeSubdomains: true
}));

// Hide X-Powered-By header
app.use(helmet.hidePoweredBy());

app.use(express.static(__dirname + '/client'));
// only accepts content-type application/json
app.use(bodyParser.json());

// Auth Middleware
// routes starting with /api will be checked for jwt token (except /api/login && /api/register)
app.use('/api/*', jwtMiddleware({ secret: config.jwtSecret}).unless({path: ['/api/login', '/api/register']}));

// Define routes
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
    msg = { errorMsg: 'Unauthorized' };
    break;
  case 'NotFoundError':
    code = err.status;
    msg = { errorMsg: 'Not Found' };
    break;
  case 'BadRequestError':
    code = err.status;
    msg = err.inner;
    break;
  default:
    code = 500;
    msg = { errorMsg: 'Internal Server Error' }; //default http 500
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
});

