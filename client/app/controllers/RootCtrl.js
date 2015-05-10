'use strict';

angular.module('unipimart')
  .controller('RootCtrl', function($scope, $rootScope, $location, userService, authService) {
    $scope.authService = authService;

    $scope.isActive = function(route) {
      return route === $location.path();
    }

    $scope.logout = function() {
      userService.logout();
    }

    $rootScope.go = function(path) {
      $location.path(path);
    }
  });