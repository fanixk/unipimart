'use strict'

angular.module('unipimart')
  .controller('MainCtrl', function($scope, $http, $window, cartService) {
    $scope.data = $scope.data || {};
    $scope.data.cartService = cartService;

    getAllProducts();

    $scope.addProduct = function(product) {
      cartService.addProduct(product);
    }

    $scope.removeProduct = function(id) {
      cartService.removeProduct(id);
    }

    $scope.search = function() {
      var searchParam = $scope.data.searchParam;
      if (!searchParam) {
        $scope.data.boundSearchParam = '';
        return getAllProducts();
      }

      $http.post('/api/catalog/search', { search: searchParam })
        .success(function(data) {
          $scope.data.products = data.products;
          $scope.data.boundSearchParam = data.searchParam;
        });
    }

    function getAllProducts() {
      $http.get('/api/catalog')
        .success(function(products) {
          $scope.data.products = products;
        });
    }
  });