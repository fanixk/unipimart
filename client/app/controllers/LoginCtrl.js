'use strict'

angular.module('unipimart')
  .controller('LoginCtrl', function($scope, $http, $window, $location) {

    $scope.submit = function() {
      $http
        .post('/api/login', $scope.user)
        .success(function(data, status, headers, config) {
          $window.sessionStorage.token = data.token;
          $location.path('/');
        })
        .error(function(data, status, headers, config) {
          // Erase the token if the user fails to log in
          delete $window.sessionStorage.token;

          // Handle login errors here
        });
    };
  });