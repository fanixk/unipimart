'use strict';

angular.module('unipimart')
  .controller('LoginCtrl', function($scope, $http, $window, $location, userService, authService) {
    $scope.data = $scope.data || {};
    authService.checkAndRedirect();

    $scope.login = function() {
      userService.login($scope.user)
        .success(function(data) {
          authService.setAuthedStatus(data);
          $location.path('/');
        }).error(function(data, status) {
          $scope.data.errorMsg = data.errorMsg;
        });
    };
  });