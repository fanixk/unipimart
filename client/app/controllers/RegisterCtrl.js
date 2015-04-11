'use strict';

angular.module('unipimart')
  .controller('RegisterCtrl', function($scope, $http, $window, $location, userService, authService) {
    $scope.data = $scope.data || {};
    authService.checkAndRedirect();

    $scope.register = function() {
      if ($scope.user.password !== $scope.user.password_confirmation) {
        $scope.data.errors = ['Passwords don\'t match.'];
        return;
      }

      userService.register($scope.user)
        .success(function(data) {
          authService.setAuthedStatus(data);
          $location.path('/');
        }).error(function(data, status) {
          $scope.data.errors = data.errors;
        });
    };
  });