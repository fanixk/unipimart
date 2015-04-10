angular.module('unipimart')
  .factory('userService', function($window, $location, $http, authService) {
    return {
      login: function(user) {
        return $http.post('/api/login', {
          email: user.email,
          password: user.password
        });
      },
      logout: function() {
        if (authService.isAuthed) {
          authService.isAuthed = false;
          delete authService.user;

          delete $window.sessionStorage.token;
          delete $window.sessionStorage.user;

          $location.path("/login");
        }
      },
      register: function(email, password, password_confirmation) {
        return $http.post('/api/register', {
          email: email,
          password: password,
          password_confirmation: password_confirmation
        });
      }
    }
  });