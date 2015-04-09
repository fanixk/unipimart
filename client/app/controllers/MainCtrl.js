'use strict'

angular.module('unipimart')
  .controller('MainCtrl', function($scope, $http, $window, $location) {
    $scope.data = $scope.data || {};

    //if not isLoggedIn (move to service)
    if(!$window.sessionStorage.token) {
      $location.path('/login');
      return;
    }

    $http.get("/api/catalog")
      .success(function(data) {
        $scope.data.products = data;
      });
  });