'use strict';

angular.module('unipimart')
  .factory('userService', function($window, $location, $http, authService, cartService) {
    return {
      login: function(user) {
        return $http.post('/api/login', {
          email: user.email,
          password: user.password
        });
      },
      logout: function() {
        if (authService.isAuthed) {
          authService.clearAuthedStatus();
          cartService.clear();
          $location.path('/login');
        }
      },
      register: function(user) {
        return $http.post('/api/register', {
          email: user.email,
          password: user.password,
          password_confirmation: user.password_confirmation
        });
      }
    };
  });