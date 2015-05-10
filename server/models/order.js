'use strict';

var _ = require('lodash'),
  sanitizer = require('sanitizer'),
  Sequelize = require('sequelize'),
  nodemailer = require('nodemailer'),
  db = require('../config/db.js'),
  Product = require('./product').Product,
  User = require('./user').User;

var INVALID_LINEITEM_ERROR = 'Invalid product or quantity.',
    MISSING_STREETNAME_ERROR = 'Missing Street Name.',
    MISSING_STREETNUM_ERROR = 'Missing Street Num.',
    MISSING_ZIPCODE_ERROR = 'Missing Zipcode.',
    MISSING_CITY_ERROR = 'Missing City.',
    MISSING_PHONE_ERROR = 'Missing Phone.';

var LineItem = db.define('line_item', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  productId: { type: Sequelize.INTEGER, foreignKey: true, allowNull: false, field: 'product_id' },
  orderId: { type: Sequelize.INTEGER, foreignKey: true, field: 'order_id' },
  quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 }
}, { timestamps: false });

var Order = db.define('order', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  price: { type: Sequelize.DECIMAL },
  streetName: { type: Sequelize.STRING, allowNull: false, field: 'street_name' },
  streetNum: { type: Sequelize.STRING, allowNull: false, field: 'street_num' },
  zipcode: { type: Sequelize.STRING, allowNull: false },
  city: { type: Sequelize.STRING, allowNull: false },
  phone: { type: Sequelize.STRING, allowNull: false },
  userId: { type: Sequelize.INTEGER, allowNull: false, foreignKey: true, field: 'user_id' }
}, { timestamps: false });

LineItem.belongsTo(Product);
LineItem.belongsTo(Order);

Order.hasMany(LineItem, { as: 'Items' });
Order.belongsTo(User);

function respondFailure() {
  return res.status(400).json({
    success: false
  });
}

function validateOrder(lineItems, address) {
  var errors = [],
    isValid = true;

  lineItems.forEach(function(item) {
    var id = item.id,
      quantity = item.quantity;
    // TODO Check numericallity
    if (!id || !quantity || quantity <= 0) {
      isValid = false;
      errors.push(INVALID_LINEITEM_ERROR);
    }
  });

  if (_.isEmpty(address.streetName)) {
    isValid = false;
    errors.push(MISSING_STREETNAME_ERROR);
  }

  if (_.isEmpty(address.streetNum)) {
    isValid = false;
    errors.push(MISSING_STREETNUM_ERROR);
  }

  if (_.isEmpty(address.zipcode)) {
    isValid = false;
    errors.push(MISSING_ZIPCODE_ERROR);
  }

  if (_.isEmpty(address.city)) {
    isValid = false;
    errors.push(MISSING_CITY_ERROR);
  }

  if (_.isEmpty(address.phone)) {
    isValid = false;
    errors.push(MISSING_PHONE_ERROR);
  }

  return {
    isValid: isValid,
    errors: errors
  };
}

function mailer(order) {
  // var transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'unipimart@gmail.com',
  //     pass: 'yolo'
  //   }
  // });

  // transporter.sendMail({
  //   from: 'unipimart@gmail.com',
  //   to: 'unipimart@gmail.com',
  //   subject: 'hello',
  //   text: 'hello world!'
  // }, function(err, info) {
  //   console.log(info);
  //   if(err) console.log(err);
  // });

  order.getUser().then(function(usr) {
    console.log('User = ', usr.email);
  });
  console.log('Price = ', order.price);
  order.getItems().then(function(it) {
    it.forEach(function(item) {
      item.getProduct().then(function(product) {
        console.log(product.name, ' x', item.quantity);
      });
    });
  });
}

function buildOrder(user, address) {
  return {
    userId: user.id,
    streetName: address.streetName,
    streetNum: address.streetNum,
    zipcode: address.zipcode,
    city: address.city,
    phone: address.phone
  };
}

function buildLineItems(orderId, lineItems) {
  var rItems = [];
  //TODO round quantity
  lineItems.forEach(function(item) {
    rItems.push({
      orderId: orderId,
      productId: item.id,
      quantity: item.quantity
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

    products.forEach(function(product) {
      // find quantity for each product (TODO: check uniqueness of product ids)
      var quantity = _.result(_.find(lineItems, { 'productId': product.id}), 'quantity');
      if(!quantity) quantity = 0;
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
        streetName: req.body.address.streetName || '',
        streetNum: req.body.address.streetNum || '',
        zipcode: req.body.address.zipcode || '',
        city: req.body.address.city || '',
        phone: req.body.address.phone || ''
      };

    var validator = validateOrder(lineItems, address);
    
    if (!validator.isValid) {
      return res.status(400)
        .json({
          success: false,
          errors: validator.errors
        });
    }

    var unsavedOrder = buildOrder(user, address);
    
    Order.create(unsavedOrder)
      .then(function(order) {
        var bLineItems = buildLineItems(order.id, lineItems);

        LineItem.bulkCreate(bLineItems)
          .then(calcTotalPrice)
          .then(function(orderPrice) {
            return setOrderPrice(orderPrice, order);
          })
          .then(function() {
            mailer(order);
          })
          .then(function() {
            return res.json({
              success: true
            });
          })
          .catch(respondFailure);
      })
      .catch(respondFailure);
  }
}

