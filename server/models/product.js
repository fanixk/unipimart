'use strict';

var _ = require('lodash'),
  sanitizer = require('sanitizer'),
  Sequelize = require('sequelize'),
  db = require('../config/db.js');

var Product = db.define('product', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: false },
  description: { type: Sequelize.TEXT },
  price: { type: Sequelize.DECIMAL, allowNull: false }
}, {
  timestamps: false
});

module.exports = {
  Product: Product,
  list: function(req, res) {
    Product.findAll()
      .then(function(products) {
        return res.json(products);
      });
  },
  search: function(req, res) {
    var searchParam = req.body.search || '';

    if (_.isEmpty(searchParam) || searchParam.indexOf('%') > -1) {
      return res.status(400)
        .json({
          msg: 'Invalid search parameter.'
        });
    }

    // html sanitize for xss protection
    searchParam = sanitizer.sanitize(searchParam);

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
      return res.json({
        products: products,
        searchParam: searchParam
      });
    });
  }
}