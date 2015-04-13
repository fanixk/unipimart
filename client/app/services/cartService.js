'use strict';

angular.module('unipimart')
  .factory('cartService', function($window) {
    return {
      cart: [],
      addProduct: function(product) {
        var added;
        this.cart.forEach(function(cartProduct) {
          if (cartProduct.id === product.id) {
            added = true;
            cartProduct.quantity++;
          }
        });
        if (!added) {
          this.cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1});
        }
        this.storeProducts(this.cart);
      },
      removeProduct: function(id) {
        this.cart.forEach(function(cartProduct) {
          if (cartProduct.id === id) {
            cartProduct.quantity--;
          }
        });
        this.storeProducts(this.cart);
      },
      getProducts: function() {
        $window.sessionStorage.cart = $window.sessionStorage.cart || [];
        try {
          return JSON.parse($window.sessionStorage.cart);
        } catch(ex) {
          return $window.sessionStorage.cart;
        }
      },
      storeProducts: function(products) {
        // sessionStorage can't store objects so we store json string
        $window.sessionStorage.cart = JSON.stringify(products);
      },
      clear: function() {
        this.cart = [];
        delete $window.sessionStorage.cart;
      },
      totalPrice: function() {
        return this.cart.reduce(function(prevVal, currVal) {
          return prevVal + currVal.price * currVal.quantity;
        }, 0);
      }
    };
  });