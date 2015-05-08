'use strict';

var _ = require('lodash'),
  sanitizer = require('sanitizer'),
  Sequelize = require('sequelize'),
  nodemailer = require('nodemailer'),
  db = require('../config/db.js'),
  Product = require('./product').Product,
  User = require('./user').User;

var LineItem = db.define('line_item', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  productId: { type: Sequelize.INTEGER, foreignKey: true, allowNull: false, field: 'product_id' },
  orderId: { type: Sequelize.INTEGER, foreignKey: true, field: 'order_id' },
  quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 }
}, {
  timestamps: false
});

var Order = db.define('order', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  price: { type: Sequelize.DECIMAL },
  streetName: { type: Sequelize.STRING, allowNull: false, field: 'street_name' },
  streetNum: { type: Sequelize.STRING, allowNull: false, field: 'street_num' },
  zipcode: { type: Sequelize.STRING, allowNull: false },
  userId: { type: Sequelize.INTEGER, allowNull: false, foreignKey: true, field: 'user_id' }
}, {
  timestamps: false
});

LineItem.belongsTo(Product);
LineItem.belongsTo(Order);

Order.hasMany(LineItem, { as: 'Items' });
Order.belongsTo(User);

function validateOrder() {

}

function mailer() {

}

function buildOrder(user, address) {
  return {
    userId: user.id,
    streetName: address.streetName,
    streetNum: address.streetNum,
    zipcode: address.zipcode
  };
}

function buildLineItems(orderId, lineItems) {
  var rItems = [];

  // validate quantity & product existance
  lineItems.forEach(function(item) {
    rItems.push({
      orderId: orderId,
      productId: item.id,
      quantity: item.quantity || 1
    });
  });
  return rItems;
}

// convert into cents to avoid float calculation errors
function priceInCents(price) {
  return Math.round(price * 100);
}

function calcTotalPrice(lineItems) {
  // get productIds
  var productIds = _.pluck(lineItems, 'productId');

  return Product.findAll({
    where: {
      id: productIds
    }
  })
  .then(function(products) {
    var totalPrice = 0.0;
    products.forEach(function(product, i) {
      // find quantity for each product (TODO: check uniqueness of product ids)
      var quantity = _.result(_.find(lineItems, { 'productId': product.id}), 'quantity');
      if(!quantity) quantity = 0.0;
      //calc total price
      totalPrice += priceInCents(product.price) * quantity;
    });
    return totalPrice / 100;
  });
}

function setOrderPrice(orderPrice, order) {
  order.price = orderPrice;
  return Order.update({price: orderPrice}, { where: { id: order.id } })
    .then(function() {
      return order;
    });
}

module.exports = {
  create: function(req, res) {
    var user = req.user,
      lineItems = req.body.cart || [],
      address = {
        streetName: req.body.streetName || '',
        streetNum: req.body.streetNum || '',
        zipcode: req.body.zipcode || ''
      };
    
    var usavedOrder = buildOrder(user, address);
    
    Order.create(usavedOrder)
    .then(function(order) {
      var bLineItems = buildLineItems(order.id, lineItems);

      LineItem.bulkCreate(bLineItems)
        .then(calcTotalPrice)
        .then(function(orderPrice) {
          return setOrderPrice(orderPrice, order);
        })
        .then(mailer)
        .then(function() {
          // order.getItems().then(function(it) { console.log(it);});
          return res.json({success: true});
        });
      });
  }
}

