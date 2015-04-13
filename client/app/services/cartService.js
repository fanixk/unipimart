'use strict';

angular.module('unipimart')
  .factory('cartService', function($window) {
    return {
      cart: [],
      addProduct: function(product) {
        var added;
        var cartProducts = this.cart.map(function(cartProduct) {
          if (cartProduct.id === product.id) {
            added = true;
            cartProduct.quantity++;
          }
          return cartProduct;
        });
        if (!added) {
          cartProducts.push({ id: product.id, name: product.name, quantity: 1});
        }
        this.storeProducts(cartProducts);
      },
      removeProduct: function(id) {
        var cartProducts = this.cart.map(function(cartProduct) {
          if (cartProduct.id === id) {
            cartProduct.quantity--;
          }
          if (cartProduct.quantity !== 0) {
            return cartProduct;
          }
        });
        this.storeProducts(cartProducts);
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
        this.cart = products;
        // sessionStorage can't store objects so we store json string
        $window.sessionStorage.cart = JSON.stringify(products);
      },
      clear: function() {
        this.cart = [];
        delete $window.sessionStorage.cart;
      }
    };
  });