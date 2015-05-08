var express = require('express'),
  router = express.Router(),
  product = require('../models/product.js'),
  user = require('../models/user.js'),
  order = require('../models/order.js');

router.post('/api/login', user.login);
router.post('/api/register', user.register);
router.get('/api/catalog', product.list);
router.post('/api/catalog/search', product.search);
router.post('/api/order', order.create);

module.exports = router;
