var _ = require('lodash'),
  Sequelize = require('sequelize'),
  db = require('../config/db.js');

// var products_seed = [
//   { name: 'Product1', description: 'This is Product1 description', price: 10},
//   { name: 'Product2', description: 'This is Product2 description', price: 20},
//   { name: 'Product3', description: 'This is Product3 description', price: 30},
//   { name: 'Product4', description: 'This is Product4 description', price: 40}
// ];

var Product = db.define('product', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: false },
  description: { type: Sequelize.TEXT },
  price: { type: Sequelize.DECIMAL, allowNull: false }
}, {
  timestamps: false
});

module.exports = {
  list: function(req, res) {
    Product.findAll()
      .then(function(products) {
        return res.json(products);
      });
  },
  search: function(req, res) {
    var searchParam = req.body.search || '';

    if (_.isEmpty(searchParam)) {
      return res.status(400)
        .json({
          msg: 'No search parameter found'
        });
    }

    // SELECT "id", "name", "description", "price" FROM "products" AS "product" 
    // WHERE ("product"."name" LIKE '%searchParam%' 
    // OR "product"."description" LIKE '%searchParam%');
    Product.findAll({
      where: {
        $or: [
          { name: { $like: '%' + searchParam + '%' } }, 
          { description: { $like: '%' + searchParam + '%' } }
        ]
      }
    })
    .then(function(products) {
      return res.json(products);
    });
  }
}