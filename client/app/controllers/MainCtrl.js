'use strict'

angular.module('unipimart')
  .controller('MainCtrl', function($scope, $http, $window, cartService) {
    $scope.data = $scope.data || {};

    $http.get("/api/catalog")
      .success(function(data) {
        $scope.data.products = data;
      });

    $scope.data.cart = function() {
      return cartService.getProducts();
    }

    $scope.addProduct = function(id) {
      cartService.addProduct(id);
    }

    $scope.removeProduct = function(id) {
      cartService.removeProduct(id);
    }
  });