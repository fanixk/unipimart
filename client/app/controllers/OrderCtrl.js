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
        if (data.success === true) {
          $scope.data.success = true;
        } else {
          $scope.data.success = false;
        }
        $scope.data.step = 4;
      });
    }
    
  });