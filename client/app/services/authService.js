angular.module('unipimart')
  .factory('authService', function($window) {
    var auth = {
      isAuthed: false,
      check: function() {
        if ($window.sessionStorage.token && $window.sessionStorage.user) {
          this.isAuthed = true;
        } else {
          this.isAuthed = false;
          delete this.user;
        }
      }
    }

    return auth;
  });