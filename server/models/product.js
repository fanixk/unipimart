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
    var name = req.body.name;

    if (_.isEmpty(name)) {
      return res.status(400)
        .json({
          msg: 'No name parameter found'
        });
    }

    Product.findAll({
        where: {
          name: {
            $like: '%' + name + '%' // Make sure sql injections can't happen
          }
        }
      })
      .then(function(products) {
        return res.json(products);
      });
  }
}