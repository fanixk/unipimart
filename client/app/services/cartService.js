'use strict';

angular.module('unipimart')
  .factory('cartService', function($window) {
    return {
      addProduct: function(id) {
        var products = this.getProducts(),
          added;
        var cartProducts = products.map(function(product) {
          if (product.id === id) {
            added = true;
            product.quantity++;
          }
          return product;
        });
        if (!added) {
          cartProducts.push({ id: id, quantity: 1});
        }
        this.storeProducts(cartProducts);
      },
      removeProduct: function(id) {
        var products = this.getProducts();
        var cartProducts = products.map(function(product) {
          if (product.id === id) {
            product.quantity--;
          }
          if (product.quantity !== 0) {
            return product;
          }
        });
        this.storeProducts(cartProducts);
      },
      getProducts: function() {
        $window.sessionStorage.cart = $window.sessionStorage.cart || [];
        return JSON.parse($window.sessionStorage.cart);
      },
      storeProducts: function(products) {
        // sessionStorage can't store objects so we store json string
        $window.sessionStorage.cart = JSON.stringify(products);
      }
    };
  });