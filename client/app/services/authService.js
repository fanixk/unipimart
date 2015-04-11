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
      },
      clearAuthedStatus: function() {
        this.isAuthed = false;
        delete this.user;

        delete $window.sessionStorage.token;
        delete $window.sessionStorage.user;
      },
      setAuthedStatus: function(data) {
        this.isAuthed = true;
        this.user = data.email;

        $window.sessionStorage.token = data.token;
        $window.sessionStorage.user = data.email;
      }
    };

    return auth;
  });