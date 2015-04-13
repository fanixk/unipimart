'use strict'

angular.module('unipimart')
  .controller('MainCtrl', function($scope, $http, $window, cartService) {
    $scope.data = $scope.data || {};
    $scope.data.cartService = cartService;

    $http.get("/api/catalog")
      .success(function(data) {
        $scope.data.products = data;
      });

    $scope.addProduct = function(product) {
      cartService.addProduct(product);
    }

    $scope.removeProduct = function(id) {
      cartService.removeProduct(id);
    }
  });