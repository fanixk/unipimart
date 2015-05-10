'use strict'

angular.module('unipimart')
  .controller('MainCtrl', function($scope, $http, $window, $location, cartService, $timeout) {
    $scope.data = $scope.data || {};
    $scope.data.cartService = cartService;
    $scope.data.lastItemAdded = {};
    getAllProducts();

    $scope.addProduct = function(product) {
      cartService.addProduct(product);
      $scope.data.lastItemAdded = product;
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

    $scope.isLastAdded = function(lineItem) {
      if (lineItem.id == $scope.data.lastItemAdded.id) {
        // reset class after 500ms
        $timeout(function() {
          $scope.data.lastItemAdded = {};
        }, 500);
        return true;
      }
    }

    function getAllProducts() {
      $http.get('/api/catalog')
        .success(function(products) {
          $scope.data.products = products;
        });
    }
  });