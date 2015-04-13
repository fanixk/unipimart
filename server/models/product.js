var _ = require('lodash');

var products = [
  { id: 1, name: 'Product1', price: 10},
  { id: 2, name: 'Product2', price: 20},
  { id: 3, name: 'Product3', price: 30},
  { id: 4, name: 'Product4', price: 40}
];

module.exports = {
  list: function(req, res) {
    res.json(products);
  },
  search: function(req, res) {
    var name = req.body.name;

    if (_.isEmpty(name)) {
      res.status(400)
        .json({
          msg: 'No name parameter found'
        });
      return;
    }

    var results = products.filter(function(product) {
      return product.name === name;
    });

    res.json(results);
  }
}
