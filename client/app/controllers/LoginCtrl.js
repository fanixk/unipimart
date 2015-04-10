'use strict'

angular.module('unipimart')
  .controller('LoginCtrl', function($scope, $http, $window, $location, userService, authService) {
    $scope.login = function() {
      userService.login($scope.user)
        .success(function(data) {
          authService.isAuthed = true;
          authService.user = data.email;

          $window.sessionStorage.token = data.token;
          $window.sessionStorage.user = data.email; // to fetch the user details on refresh

          $location.path("/");

        }).error(function(status, data) {
          console.log(status, data);
        });
    };
  });