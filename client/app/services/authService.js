'use strict';

angular.module('unipimart')
  .factory('authService', function($window, $location) {
    var auth = {
      isAuthed: false,
      check: function() {
        if ($window.sessionStorage.token && $window.sessionStorage.user) {
          this.isAuthed = true;
        } else {
          this.isAuthed = false;
          delete this.user;
        }
      },
      checkAndRedirect: function() {
        if(this.isAuthed){
          $location.path('/');
        }
      }
    };

    return auth;
  });