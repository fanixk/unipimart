'use strict';

angular
  .module('unipimart', [
    'ngRoute',
    'ngSanitize',
  ])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .factory('httpInterceptor', http_interceptor)
  .factory('authInterceptor', auth_interceptor)
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
    $httpProvider.interceptors.push('authInterceptor');
  });

function auth_interceptor($rootScope, $q, $window, authService, $location, cartService) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },
    response: function(response) {
      // restore authService / cartService on refresh
      if (response && response.status === 200 && $window.sessionStorage.token && !authService.isAuthed) {
        authService.isAuthed = true;
        authService.user = $window.sessionStorage.user;
        cartService.cart = cartService.getProducts() || [];
      }
      return response || $q.when(response);
    },
    responseError: function(response) {
      // token expiration
      if (response && response.status === 401 && ($window.sessionStorage.token || authService.isAuthed)) {
        authService.clearAuthedStatus();
        cartService.clear();
        $location.path('/login');
      } else if (response && response.status === 401) {  // requiredLogin
        $location.path('/login');
      }

      return $q.reject(response);
    }
  };
}

function http_interceptor($q, $rootScope, $injector) {
  var _http = null;

  return {
    request: function(config) {
      // Show loader
      $rootScope.loader = true;
      return config || $q.when(config);
    },
    response: function(response) {
      _http = _http || $injector.get('$http');

      if (_http.pendingRequests.length < 1) {
        // Hide loader
        $rootScope.loader = false;
      }

      return response || $q.when(response);
    },
    responseError: function(response) {
      _http = _http || $injector.get('$http');

      if (_http.pendingRequests.length < 1) {
        // Hide loader
        $rootScope.loader = false;
      }

      return $q.reject(response);
    }
  };
}