// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic.service.core', 'ngCordova', 'starter.controllers', 'starter.services', 'starter.constants', 'starter.filters'])
    .run(function($ionicPlatform, $rootScope, $state, $ionicLoading, $localstorage, $ionicPopup, $cordovaSplashscreen, $cordovaNetwork, NotificationService, Analytics) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            Analytics.init('UA-74057618-1');
        });

        //check for network connection

        // listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
            NotificationService.showAlert('Connection lost', 'Please check your internet connection');
        });

        //keep user logged in
        $rootScope.globals = {};
        $rootScope.globals.user = $localstorage.getObject('user');

        $rootScope.$on('$stateChangeStart', function(event, toState) {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = !(toState.url == '/login' || toState.url == '/welcome' || toState.url == '/signup' || toState.url == '/terms' || toState.url == '/') || false;

            var notLoggedIn = $rootScope.globals.user.token === undefined;

            if (restrictedPage && notLoggedIn) {
                event.preventDefault();
                $state.go("welcome");
            }
        });

        $rootScope.$on('loading:show', function(args) {
            $ionicLoading.show({ template: '<ion-spinner class="spinner-energized"></ion-spinner>' });
        })

        $rootScope.$on('loading:hide', function(msg, data) {
            $ionicLoading.hide();
        })

        $rootScope.$on('request:error', function(msg, data) {
            switch (data.statusText) {
            case 'Not Found':
                NotificationService.showPopup('We can\'t reach our servers', 'So sorry, we\'are already working on this, please check back in a couple of minutes.');
                break;
            }
        });

    })
    .config(function($httpProvider) {
        $httpProvider.interceptors.push('LoadingInterceptor');
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'templates/signup.html',
                controller: 'SignupCtrl'
            })
            .state('welcome', {
                url: '/welcome',
                templateUrl: 'templates/welcome.html',
                controller: 'WelcomeCtrl'
            })
            .state('institution', {
                url: '/institution',
                templateUrl: 'templates/institution.html',
                controller: 'InstitutionCtrl'
            })
            .state('unidetails1', {
                url: '/unidetails1',
                templateUrl: 'templates/unidetails1.html',
                controller: 'InstitutiondetailsCtrl'
            })
            .state('unidetails2', {
                url: '/unidetails2',
                templateUrl: 'templates/unidetails2.html',
                controller: 'InstitutiondetailsCtrl'
            })
            .state('prof1', {
                url: '/prof1',
                templateUrl: 'templates/prof1.html',
                controller: 'CpaCtrl'
            })
            .state('prof2', {
                url: '/prof2',
                templateUrl: 'templates/prof2.html',
                controller: 'CpaCtrl'
            })
            .state('prof3', {
                url: '/prof3',
                templateUrl: 'templates/prof3.html',
                controller: 'CpaCtrl'
            })
            .state('prof4', {
                url: '/prof4',
                templateUrl: 'templates/prof4.html',
                controller: 'CpaCtrl'
            })
            .state('highschool', {
                url: '/highschool',
                templateUrl: 'templates/highschool.html',
                controller: 'InstitutiondetailsCtrl'
            })
            .state('app.units', {
                url: '/units',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/units.html',
                        controller: 'UnitsCtrl'
                    }
                }
            })
            .state('app.topics', {
                url: '/topics/:unitId/:unitName',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/topics.html',
                        controller: 'TopicsCtrl'
                    }
                }
            })
            .state('app.my-topics', {
                url: '/my-topics',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/my-topics.html',
                        controller: 'MyTopicsCtrl'
                    }
                }
            })
            .state('app.questions', {
                url: '/questions/:topicId/:topicName/',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/questions.html',
                        controller: 'QuestionsCtrl'
                    }
                }
            })
            .state('app.answer', {
                url: '/answer/:questionId/:questionText',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/answer.html',
                        controller: 'AnswerCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/units');
    });
