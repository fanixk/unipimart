var app = angular.module('unipimart', []);

app.controller('MainCtrl', function($scope, $http) {
  $scope.data = $scope.data || {};

  $http.get("/api/catalog")
    .success(function(data) {
      $scope.data.products = data;
    });
});