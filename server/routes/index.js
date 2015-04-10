var express = require('express'),
  router = express.Router(),
  product = require('../models/product.js'),
  user = require('../models/user.js');

router.post('/api/login', user.login);
router.post('/api/register', user.register);
router.get('/api/catalog', product.list);

module.exports = router;
