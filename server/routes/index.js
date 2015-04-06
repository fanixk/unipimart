var express = require('express'),
  router = express.Router(),
  product = require('../models/product.js');

router.get('/api/catalog', product.list);

module.exports = router;