'use strict'

angular.module('unipimart')
  .controller('RootCtrl', function($scope, $location, userService, authService) {
    $scope.authService = authService;

    $scope.isActive = function(route) {
      return route === $location.path();
    }

    $scope.logout = function() {
      userService.logout();
    }
  });