angular.module('starter.controllers', ['ngMessages'])

.controller('AppCtrl', function ($scope, $rootScope, $state, $cordovaEmailComposer, $localstorage, $ionicLoading, $ionicPopover, $cordovaSocialSharing, Analytics, Darasa, NotificationService, $ionicPlatform) {
    $scope.firstName = $rootScope.globals.user.firstName;
    $scope.lastName = $rootScope.globals.user.secondName;
    $scope.email = $rootScope.globals.user.email;
    $scope.userId = $rootScope.globals.user.userId;
    $scope.token = $rootScope.globals.user.token;

    Darasa.GetOwnedTopics($scope.token).then(function (data) {
        $scope.ownedTopics = data.data.data.length;
    });

    $scope.picture = $rootScope.globals.user.picture || 'img/avatar.jpg';
    Analytics._setUserId($scope.token);

    //popover control
    $ionicPopover.fromTemplateUrl('my-popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });

    $scope.openPopover = function ($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function () {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function () {
        // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function () {
        // Execute action
    });

    $scope.shareOnWhatsapp = function () {
        var message = 'Darasa ensures you will pass that exam. Check it out at';
        var image = undefined;
        var link = 'https://play.google.com/store/apps/details?id=ke.co.darasa.app&hl=en';

        $cordovaSocialSharing
            .shareViaWhatsApp(message, image, link)
            .then(function (result) {
                // Success!
            }, function (err) {
                // An error occurred. Show a message to the user
                NotificationService.showAlert('<b>Oops</b>', 'You have to have the Whatsapp application installed for this feature.');
            });
    }

    $scope.logout = function () {
        $scope.popover.hide();
        $localstorage.set('user', "");
        $rootScope.globals.user = "";
        this.user = "";
        if (window.plugins !== undefined) {
            if ($rootScope.globals.user.picture !== undefined) {
                window.plugins.googleplus.logout(function () { })
            }
        }
        Analytics._trackEvent('Users', 'Log out', '');

        $ionicPlatform.ready(function () {
            intercom.reset();
        });

        $state.go('login');
    }

    $scope.submitFeedback = function () {
        $ionicPlatform.ready(function () {
            intercom.displayConversationsList(function () {

            }, function () {

            });
        });
    }
})

.controller('SignupCtrl', function ($scope, User, $localstorage, $state, $rootScope, $ionicModal, Analytics, $ionicSlideBoxDelegate, $ionicPlatform) {
    Analytics._trackView('Signup page');
    $scope.activeSlide = 0;

    User.Terms().then(function (data) {
        console.log(data);
        $scope.terms = data.data.text;
    });

    $scope.lockSlide = function () {
        $ionicSlideBoxDelegate.enableSlide(false);
    }

    $scope.goToSignUpForm = function () {
        $scope.activeSlide = 1;
    }

    $scope.signup = function (newUser) {
        User.Create(newUser).then(function (data) {
            newUser.token = data.data.authentication_token;
            User.GetByToken(data.data.authentication_token).then(function (data) {
                newUser.userId = data.data.user_id;
                newUser.firstName = data.data.first_name;
                newUser.secondName = data.data.second_name;
                newUser.topics = data.data.topics;
                $localstorage.setObject('user', newUser);
                $rootScope.globals.user = newUser;
                Analytics._trackEvent('Users', 'Sign up', 'Signup with email');
                //$state.go('app.units');
                $state.go('institution');

                $ionicPlatform.ready(function () {
                    intercom.registerIdentifiedUser({ userId: data.data.user_id });

                    if (ionic.Platform.isIOS()) {
                        intercom.registerForPush();
                    }

                    if (ionic.Platform.isAndroid()) {
                        intercom.registerForPush(data.data.user_id.toString());
                    }
                });
            });
        });
    }

    //ionic modal
    $ionicModal.fromTemplateUrl('terms.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function () {
        Analytics._trackView('Terms and Conditions Page');
        Analytics._trackEvent('Users', 'View Terms and Conditions', '');
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

})

.controller('LoginCtrl', function ($scope, User, $state, $rootScope, $localstorage, $ionicPopup, Analytics, NotificationService, $ionicPlatform) {
    $scope.isAvailable = false;

    if (window.plugins !== undefined) {
        window.plugins.googleplus.isAvailable(
          function (available) {
              if (available) {
                  $scope.isAvailable = true;
              }
          }
      );
    }

    Analytics._trackView('Login page');

    $scope.login = function (user) {
        User.GetByEmail(user).then(function (data) {
            user.token = data.data.authentication_token;
            User.GetByToken(data.data.authentication_token).then(function (data) {

                $ionicPlatform.ready(function () {
                    intercom.registerIdentifiedUser({ userId: data.data.user_id });

                    if (ionic.Platform.isIOS()) {
                        intercom.registerForPush();
                    }

                    if (ionic.Platform.isAndroid()) {
                        intercom.registerForPush(data.data.user_id.toString());
                    }
                });

                user.userId = data.data.user_id;
                user.firstName = data.data.first_name;
                user.secondName = data.data.second_name;
                user.email = data.data.email;
                user.picture = undefined;
                $localstorage.setObject('user', user);
                $rootScope.globals.user = user;
                Analytics._trackEvent('Users', 'Log in', 'Login with email');
                $state.go('app.units');
            });
        });
    }

    $scope.loginInWithGoogle = function () {
        var user = {};
        var name = '';
        var displayName = "";
        // $ionicLoading.show({
        //   template: 'Please wait...'
        // });

        window.plugins.googleplus.login(
          {},
          function (userData) {
              console.log(userData);
              //   user.userId = userData.userId;
              //   name = userData.displayName.split(" ");
              //   user.firstName = name[0];
              //   user.lastName = name[1];
              //   user.email = userData.email;
              //   user.picture = userData.imageUrl;

              showPopup();
              function showPopup() {
                  $scope.data = {};
                  var myPopup = $ionicPopup.show({
                      template: '<input type="text" ng-model="data.phoneNumber" placeholder="07XX XXX XXX">',
                      title: 'Enter phone number',
                      scope: $scope,
                      buttons: [
                        { text: 'Cancel' },
                        {
                            text: '<b>Continue</b>',
                            type: 'button-energized',
                            onTap: function (e) {
                                if (!$scope.data.phoneNumber) {
                                    //don't allow the user to close unless he enters wifi password
                                    e.preventDefault();
                                } else {
                                    return $scope.data.phoneNumber;
                                }
                            }
                        }
                      ]
                  });
                  myPopup.then(function (res) {
                      console.log(res);
                      // if(res == undefined){
                      //     $ionicLoading.hide();
                      //     return;
                      // } else{
                      //   user.phoneNumber = res;
                      //   User.loginInWithGoogle(user).then(function(data){
                      //     // Analytics._trackEvent('Users', 'Log in', 'Login with Google');
                      //     user.token = data.data.auth_token;
                      //     user.userId = data.data.user_id;
                      //     $localstorage.setObject('user', user);
                      //     $ionicLoading.hide();
                      //     $state.go('app.units');
                      //   });
                      // }
                  });
              }
          },
          function (msg) {
              $ionicLoading.hide();
              NotificationService.showPopup('Oops', msg);
          }
        );
    }
})

.controller('UnitsCtrl', function ($scope, $state, Darasa, Analytics) {
    $scope.$on('$ionicView.enter', function () {
        Analytics._trackView('Units page');

        Darasa.GetUnits($scope.token).then(function (data) {
            $scope.units = data.data.data;
        });
    });

    $scope.topics = function (unitId, unitText) {
        Analytics._trackEvent('Units', 'View unit topics', unitText);
        $state.go('app.topics', { unitId: unitId, unitName: unitText });
    }
    $scope.doRefresh = function () {
        Darasa.GetUnits($scope.token).then(function (data) {
            $scope.units = data.data.data;
        }).finally(function () {
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
})

.controller('TopicsCtrl', function ($scope, $state, Darasa, $stateParams, Analytics) {
    $scope.$on('$ionicView.enter', function () {
        Analytics._trackView('Topics page');
        $scope.unitName = $stateParams.unitName;

        Darasa.GetTopics($scope.token, $stateParams.unitId).then(function (data) {
            if (data.data.error === 'No topics for this unit') {
                $scope.error = 'No topics for this unit';
            }
            $scope.topics = data.data.data
        });
    });

    $scope.questions = function (topicId, topicName) {
        Analytics._trackEvent('Topics', 'View topic questions', topicName);
        $state.go('app.questions', { topicId: topicId, topicName: topicName });
    }

    $scope.doRefresh = function () {
        Darasa.GetTopics($scope.token, $stateParams.unitId).then(function (data) {
            if (data.data.msg === 'No topics for this unit') {
                $scope.msg = 'No topics for this unit';
            }
            $scope.topics = data.data.data
        }).finally(function () {
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
})

.controller('MyTopicsCtrl', function ($scope, $state, Darasa, $stateParams, Analytics) {
    $scope.$on('$ionicView.enter', function () {
        Analytics._trackView('My topics page');
        Darasa.GetOwnedTopics($scope.token).then(function (data) {
            $scope.ownedTopics = data.data.data;
            $scope.sampleTopics = data.data.samples;
            console.log(data.data.samples);
        });
    });

    $scope.questions = function (topicId, topicName) {
        Analytics._trackEvent('Topics', 'View topic questions - from my topics page', topicName);
        $state.go('app.questions', { topicId: topicId, topicName: topicName });
    }

    $scope.doRefresh = function () {
        Darasa.GetOwnedTopics($scope.token).then(function (data) {
            $scope.ownedTopics = data.data.data;
        }).finally(function () {
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
})

.controller('QuestionsCtrl', function ($scope, $state, Darasa, $stateParams, $scope, $ionicModal, NotificationService, $ionicPopup, Analytics, $ionicPlatform, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(false);

    var loading = false;
    $scope.isLastPage = false;
    $scope.questions = [];
    var pageNumber = 0;

    $scope.$on('$ionicView.enter', function () {
        Analytics._trackView('Questions page');
        $scope.topicName = $stateParams.topicName;

        //Darasa.GetQuestions($scope.token, $stateParams.topicId, page).then(function (data) {
        //    $scope.questions = data.data.data;
        //}, function (error) {
        //    console.log(error);
        //});

        Darasa.GetOwnedTopics($scope.token).then(function (data) {
            if (data.data.data) {
                data.data.data.forEach(function(ownedTopic) {
                    if (ownedTopic.id === $stateParams.topicId) {
                        $scope.ownsTopic = true;
                    }
                });
            }

            if (data.data.samples) {
                data.data.samples.forEach(function (ownedTopic) {
                    if (ownedTopic.id === $stateParams.topicId) {
                        $scope.ownsTopic = true;
                    }
                });
            }
            console.log(data);
            
        });
    });

    $scope.loadMore = function() {
        //if (loading) {
        //    return;
        //}

        loading = true;
        pageNumber = pageNumber + 1;

        Darasa.GetQuestions($scope.token, $stateParams.topicId, pageNumber).then(function (data) {
            Array.prototype.push.apply($scope.questions, data.data.data);

            if (!data.data.data.length) {
                $scope.isLastPage = true;
            }
            
            $scope.$broadcast('scroll.infiniteScrollComplete');

            loading = false;
        }, function (error) {
            console.log(error);

            $scope.$broadcast('scroll.infiniteScrollComplete');

            loading = false;
        });
    }

    $scope.confirmPayment = function (mpesaCode) {
        Analytics._trackEvent('Topics', 'Confirm purchase', $scope.topicName);
        Darasa.PurchaseUnit($scope.userId, $stateParams.topicId, mpesaCode, $scope.token).then(function (data) {
            Analytics._addTransaction(mpesaCode, "Darasa mobile application", "50");
            Analytics._addTransactionItem(mpesaCode, $scope.topicName, "50", "Topics");
            if (data.error === undefined) {
                Analytics._trackEvent('Topics', 'Complete purchase', $scope.topicName);
                $scope.ownsTopic = true;
                $scope.modal.hide();
                NotificationService.showPopup('Success', data.data.msg);
            }
        })
    }

    $scope.answer = function (questionId, questionText) {
        if ($scope.ownsTopic) {
            Analytics._trackEvent('Questions', 'View answer', questionId);
            $state.go('app.answer', { questionId: questionId, questionText: questionText });
        } else {
            $scope.showPopup();
        }
    }

    $scope.doRefresh = function () {
        Darasa.GetQuestions($scope.token, $stateParams.topicId).then(function (data) {
            $scope.questions = data.data.data
        }).finally(function () {
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
    //payment pop up
    $scope.showPopup = function () {
        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            template: '<p class="text-center">When you purchase a topic you get access to all the answers in the topic.</p>',
            title: '<b class="energized">Purchase this topic</b>',
            buttons: [
              { text: 'Cancel' },
              {
                  text: '<b>Purchase</b>',
                  type: 'button-energized',
                  onTap: function (e) {
                      $scope.openModal();
                  }
              }
            ]
        });
    }

    $scope.reportIssue = function () {
        Analytics._trackEvent('Users', 'Submit feed back', 'Started');

        $ionicPlatform.ready(function () {
            intercom.displayMessageComposer(function () {

            }, function () {

            });
        });
    }

    //ionic modal
    $ionicModal.fromTemplateUrl('purchase.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function () {
        Analytics._trackEvent('Topics', 'Purchase topic', $scope.topicName);
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        Analytics._trackEvent('Topics', 'Cancel purchase', $scope.topicName);
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

})

.controller('AnswerCtrl', function ($scope, $state, Darasa, $stateParams, Analytics) {
    $scope.$on('$ionicView.enter', function () {
        Analytics._trackView('Answers page');

        Darasa.GetAnswer($scope.token, $stateParams.questionId).then(function (data) {
            console.log(data);
            $scope.question = $stateParams.questionText;
            $scope.answer = data.data.data;
        });
    });

    $scope.doRefresh = function () {
        Darasa.GetAnswer($scope.token, $stateParams.questionId).then(function (data) {
            $scope.question = $stateParams.questionText;
            $scope.answer = data.data.text;
        }).finally(function () {
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
})

.controller('WelcomeCtrl', function ($scope, $state) {
    $scope.goToSignUp = function () {
        $state.go('signup');
    }

    $scope.goToLogin = function () {
        $state.go('login');
    }
})

.controller('InstitutionCtrl', function ($scope, $state, $rootScope, Institutions, $cordovaToast) {
    $scope.goToUni = function () {
        //$state.go('unidetails1');
        var details = {
            auth_token: $rootScope.globals.user.token,
            user_id: $rootScope.globals.user.userId,
            institution_id: "0000d2fc-fe4d-4f7f-b47b-921696208a0a",
            course_id: "",
            level: ""
        }

        Institutions.addToUserProfile(details).then(function () {
        }, function () {
            $cordovaToast
                .show("Couldn't update your data", 'long', 'bottom')
                .then(function (success) {
                    // success
                }, function (error) {
                    // error
                });
        });

        $state.go('app.units');
        $state.go('app.units');
    }

    $scope.goToHighSchool = function () {
        $state.go('highschool');
    }

    $scope.goToProf = function () {
        $state.go('prof1');
    }

    $scope.loginUser = function () {
        $state.go('app.units');
    }
})

.controller('CpaCtrl', function ($scope, $state, Institutions, $rootScope, $cordovaToast) {
    $scope.$on('$ionicView.enter', function () {
        $cordovaToast
            .show('Loading list of available institutions', 'long', 'bottom')
            .then(function (success) {
                // success
            }, function (error) {
                // error
            });

        var credentials = {
            auth_token: $rootScope.globals.user.token,
            type_id: "ddd5e513-73a6-47ce-a66a-2b704655720a"
        }

        Institutions.getInstitutions(credentials).then(function (data) {
            $scope.institutions = data;
        });
    });

    $scope.finish = function () {
        var details = {
            auth_token: $rootScope.globals.user.token,
            user_id: $rootScope.globals.user.userId,
            institution_id: $scope.selectedInstitution,
            course_id: "",
            level: ""
        }

        Institutions.addToUserProfile(details).then(function () {
        }, function() {
            $cordovaToast
                .show("Couldn't update your data", 'long', 'bottom')
                .then(function(success) {
                    // success
                }, function(error) {
                    // error
                });
        });

        $state.go('app.units');
    }

    //$scope.profGoToNext = function () {
    //    $state.go('prof2');
    //}

    //$scope.profGoToNext2 = function () {
    //    $state.go('prof3');
    //}

    //$scope.profGoToNext3 = function () {
    //    $state.go('prof4');
    //}

    //$scope.finishProfessional = function () {
    //    $state.go('app.units');
    //}
})

.controller('InstitutiondetailsCtrl', function ($scope, $state) {
    $scope.goToNext = function () {
        $state.go('unidetails1');
    }

    $scope.loginUser = function () {
        $state.go('app.units');
    }

    $scope.goToUni2 = function () {
        $state.go('unidetails2');
    }

    $scope.finishUni = function () {
        $state.go('app.units');
    }

    $scope.profGoToNext = function () {
        $state.go('prof2');
    }

    $scope.profGoToNext2 = function () {
        $state.go('prof3');
    }

    $scope.profGoToNext3 = function () {
        $state.go('prof4');
    }

    $scope.finishProfessional = function () {
        $state.go('app.units');
    }

    $scope.finishHighSchool = function () {
        $state.go('app.units');
    }
});

