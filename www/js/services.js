angular.module('starter.services', [])

.factory('User', function($http, ApiEndpoint, NotificationService) {

  var Create = function(newUser) {
    return $http.post(ApiEndpoint.url + '/sign_up', { "user": {email: newUser.email, first_name: newUser.firstName, second_name: newUser.lastName, password: newUser.password, phone_number: newUser.phoneNumber} })
      .then(function(data) {
        return data;
      }, function(error){
        NotificationService.showPopup('Oops', error.data.error);
      });
  };

  var GetByToken = function(token) {
    return $http.get(ApiEndpoint.url +'/user_details.json?auth_token='+ token)
      .then(function(data) {
          return data;
      }, function(error){
        NotificationService.showPopup('Oops', error.data.error);
      });
  };

  var Terms = function() {
    return $http.get(ApiEndpoint.url +'/terms', { cache: true})
      .then(function(data) {
          return data;
      }, function(error){
        NotificationService.showPopup('Oops', error.data.error);
      });
  };

  var GetByEmail = function(user) {
    return $http.post(ApiEndpoint.url +'/sign_in', {"user_login": {email: user.email, password: user.password} })
      .then(function(data) {
          return data;
      }, function(error){
        console.log(error.data);
        NotificationService.showPopup('Oops', error.data.error);
      });
  };

  var KillSession = function(token) {
    return $http.delete(ApiEndpoint.url +'/sign_in', {"auth_token": token})
      .then(function(data) {
        console.log(data);
          return data;
      }, function(error){
        console.log(error.data);
        NotificationService.showPopup('Oops', error.data.error);
      });
  };

  return {
    Create: Create,
    GetByToken: GetByToken,
    GetByEmail: GetByEmail,
    KillSession: KillSession,
    Terms: Terms
  };
})

.factory('Darasa', function($http, ApiEndpoint, NotificationService) {

  var GetUnits = function(token) {
    return $http.get(ApiEndpoint.url +'/units.json?auth_token='+ token, { cache: true})
      .then(function(data) {
          return data;
      }, function(error){
        NotificationService.showPopup('Oops', error.data.error);
      });
  };

  var GetTopics = function(token, unitId) {
    return $http.get(ApiEndpoint.url +'/topics.json?auth_token=' + token + '&unit_id=' + unitId, { cache: true})
      .then(function(data) {
          return data;
      }, function(error){
        NotificationService.showPopup('Oops', error.data.error);
      });
  };

  var GetOwnedTopics = function(token) {
    return $http.get(ApiEndpoint.url +'/my_topics.json?auth_token='+ token)
      .then(function(data) {
          return data;
      }, function(error){
        NotificationService.showPopup('Oops', error.data.error);
      });
  };


  var PurchaseUnit = function(userId, topicId, mpesaCode, token) {
    return $http.post(ApiEndpoint.url +'/pay', {"payment": {user_id: userId, topic_id: topicId, mpesa_code: mpesaCode}, auth_token: token})
      .then(function(data) {
          return data;
      }, function(error){
        NotificationService.showPopup('Oops', error.data.error);
        return error.data;
      });
  };

  var GetQuestions = function(token, topicId) {
    return $http.get(ApiEndpoint.url +'/questions.json?topic_id=' + topicId + '&auth_token=' + token, { cache: true})
      .then(function(data) {
          return data;
      }, function(error){
        NotificationService.showPopup('Oops', error.data.error);
      });
  };

  var GetAnswer = function(token, questionId) {
    return $http.get(ApiEndpoint.url +'/answers.json?auth_token=' + token + '&question_id=' + questionId, { cache: true})
      .then(function(data) {
          return data;
      }, function(error){
        NotificationService.showPopup('Oops', error.data.error);
      });
  };

  return {
    GetUnits: GetUnits,
    GetTopics: GetTopics,
    PurchaseUnit: PurchaseUnit,
    GetOwnedTopics: GetOwnedTopics,
    GetQuestions: GetQuestions,
    GetAnswer: GetAnswer
  };
})

.service('NotificationService', function($timeout, $ionicPopup, $rootScope) {
    return {
      showAlert: function(title, msg) {
        var alertPopup = $ionicPopup.alert({
          title: title,
          template: msg
        });
        $timeout(function() {
          alertPopup.close(); //close the popup after 3 seconds for some reason
        }, 8000);
      },

      showPopup: function(title, msg) {
        $rootScope.data = {};
        var myPopup = $ionicPopup.show({
          template: '<p class="text-center">'+ msg + '</p>',
          title: '<b class="energized">'+ title + '</b>'
        });
        $timeout(function() {
          myPopup.close(); //close the popup after 3 seconds for some reason
        }, 4000);
      }
    }
  })

  .service('LoadingInterceptor', function($rootScope, $q, $log, BroadcastService, $timeout) {
  return {
    request: function(config) {
      BroadcastService.send('loading:show');
      return config
    },
    requestError: function(rejection) {
      BroadcastService.send('loading:hide');
      $log.error('Request error:', rejection);
      return $q.reject(rejection);
    },
    response: function(response) {
      BroadcastService.send('loading:hide');
      return response
    },
    responseError: function(rejection) {
      BroadcastService.send('loading:hide');
      $timeout(function() {
        BroadcastService.send('request:error', rejection);
      }, 500);
      $log.error('Response error:', rejection);
      return $q.reject(rejection);
    }
  }
})

.factory('BroadcastService', function($rootScope) {
  return {
    send: function(msg, data) {
      if (typeof(data)==='undefined') data = 'none';
      $rootScope.$broadcast(msg, data);
    }
  }
})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

.factory('Analytics', ['$cordovaGoogleAnalytics', function($cordovaGoogleAnalytics) {
  return {
    init: function(trackingId) {
      function _waitForAnalytics(){
        if(typeof analytics !== 'undefined'){
          $cordovaGoogleAnalytics.debugMode();
          $cordovaGoogleAnalytics.startTrackerWithId(trackingId);
        }
        else{
          setTimeout(function(){
            _waitForAnalytics();
            },250);
        }
      };
      _waitForAnalytics();
    },

    _setUserId: function(userId) {
      function _waitForAnalytics(){
        if(typeof analytics !== 'undefined'){
          $cordovaGoogleAnalytics.setUserId(userId);
        }
        else{
          setTimeout(function(){
            _waitForAnalytics();
            },250);
        }
      };
      _waitForAnalytics();
    },

    _trackView: function(view){
      function _waitForAnalytics(){
        if(typeof analytics !== 'undefined'){
            $cordovaGoogleAnalytics.trackView(view);
        }
        else{
          setTimeout(function(){
            _waitForAnalytics();
            },250);
        }
      };
      _waitForAnalytics();
    },

    _trackEvent: function(category, action, label){
      function _waitForAnalytics(){
        if(typeof analytics !== 'undefined'){
            $cordovaGoogleAnalytics.trackEvent(category, action, label);
        }
        else{
          setTimeout(function(){
            _waitForAnalytics();
            },250);
        }
      };
      _waitForAnalytics();
    },

    _addTransaction: function(transactionId, store, cost){
      function _waitForAnalytics(){
        if(typeof analytics !== 'undefined'){
              $cordovaGoogleAnalytics.addTransaction(transactionId, store, cost, '', '', 'KSH');
        }
        else{
          setTimeout(function(){
            _waitForAnalytics();
            },250);
        }
      };
      _waitForAnalytics();
    },

    _addTransactionItem: function(transactionId, itemName, price, category){
      function _waitForAnalytics(){
        if(typeof analytics !== 'undefined'){
          $cordovaGoogleAnalytics.addTransactionItem(transactionId, itemName, '', category, price, '1');
        }
        else{
          setTimeout(function(){
            _waitForAnalytics();
            },250);
        }
      };
      _waitForAnalytics();
    }
  }
}]);
