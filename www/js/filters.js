angular.module('starter.filters', [])

  .filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
      return $sce.trustAsResourceUrl(val);
    };
  }])

  .filter('unsafe', function($sce) {
    return function(val) {
      return $sce.trustAsHtml(val);
    }; });
