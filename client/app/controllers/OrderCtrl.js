'use strict';

angular.module('unipimart')
  .controller('OrderCtrl', function($scope, $http, $window, $location, userService, authService, cartService) {
    $scope.data = $scope.data || {};
    authService.redirectUnauthorized();
    $scope.data.cartService = cartService;
    $scope.data.step = 1;
    $scope.address = {};

    $scope.showAddressForm = function() {
      $scope.data.step = 2;
    }

    $scope.showOverview = function() {
      $scope.data.step = 3;
    }

    $scope.confirm = function() {
      $http.post('/api/order', {
        cart: cartService.getProducts(),
        address: $scope.address
      }).success(function(data) {
        $scope.data.success = data.success;
        $scope.data.orderId = data.id;
        $scope.data.step = 4;
      });
    }

  });