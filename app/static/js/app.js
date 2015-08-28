(function() {
    var app = angular.module('ghca', ['angularMoment','truncate','ui.bootstrap']);

    app.controller("UserController", ["$scope", "$http","$log", "moment", function($scope, $http, $log, moment) {
        $scope.eventPageSize = 50; // constant

        // TODO Is this how you fake enums in JS?! I hate JS.
        $scope.tabs = {
            none: 0,
            repoList: 1,
            eventList: 2
        };
        $scope.range = function(x) {
            return Array.apply(null, Array(x)).map(function (_, i) {return i+1;});
        };


        $scope.currentTab = $scope.tabs.repoList;
        $scope.isCurrentTab = function(t) {
            return $scope.currentTab === t;
        };
        $scope.setCurrentTab = function(t) {
            $scope.currentTab = t;
            if(t == $scope.tabs.eventList) {
                $scope.getGHEvents();
            }
        };

        $scope.initialize = function() {
            $scope.username = "";
            $scope.processedUsername = ""; // The data below is for...
            $scope.userUrl = "";
            $scope.eventCount = 0;
            $scope.repos = [];

            $scope.clearEvents();
        };

        $scope.clearEvents = function() {
            $scope.eventPages = {}; // a cache of sorts
            $scope.eventPageCount = 0;
            $scope.currentEventPage = 1;
            $scope.events = []; // the current page
            $scope.eventCount = 0;
        };

        $scope.initialize();

        // Have we retrieved the user's information (except a list of their events)?
        $scope.processed = false;
        $scope.processing = false;
        $scope.hasResults = false;

        $scope.setCurrentEventsPage = function(i) {
            $scope.currentEventPage = i;
            $scope.getGHEvents();
        };

        $scope.eventPageChanged = function() {
            $scope.setCurrentEventsPage($scope.currentEventPage);
        };

        $scope.getGHEvents = function() {
            // Cache :)
            if ($scope.eventPages[$scope.currentEventPage]) {
                $scope.events = $scope.eventPages[$scope.currentEventPage];
                return;
            }

            var userCtrl = this;
            $http.get('/user/'+$scope.processedUsername+'/events/'+$scope.currentEventPage, {})
                .success(function(data) {
                    userCtrl.eventPages[$scope.currentEventPage] = data.events;
                    userCtrl.events = data.events;
                })
                .error(function(data) {
                    $log.error(data);
                });
        };

        $scope.setUser = function() {
            var userCtrl = this;
            $scope.processed = false;
            $scope.processing = true;
            $scope.eventPages = {}; // clear cache
            $http.get('/user/'+$scope.username, {})
                .success(function(data) {
                    userCtrl.processing = false;
                    $scope.eventCount = data.eventCount;
                    userCtrl.hasResults = data.eventCount ? true : false;
                    userCtrl.eventPageCount = Math.ceil(
                        data.eventCount / $scope.eventPageSize);
                    userCtrl.multipleEventPages = (
                        $scope.eventCount > $scope.eventPageSize);
                    userCtrl.repos = data.repos;
                    userCtrl.userUrl = "https://github.com/"+data.username;
                    userCtrl.processedUsername = data.username;
                    userCtrl.processed = true;
                    userCtrl.processing = false;
                })
                .error(function(data) {
                    $log.error(data);
                    userCtrl.processing = false;
                });

        };
    }]);

    app.directive("eventOcticon", function() {

        var octiconMap = {
            "GollumEvent"        : "book",
            "IssuesEvent"        : "issue-opened",
            "PushEvent"          : "repo-push",
            "CommitCommentEvent" : "comment",
            "ReleaseEvent"       : "tag",
            "PublicEvent"        : "megaphone",
            "MemberEvent"        : "person",
            "IssueCommentEvent"  : "comment-discussion"
        };

        var eventDescriptionMap = {
            "GollumEvent"        : "Wiki",
            "IssuesEvent"        : "Issue",
            "PushEvent"          : "Push",
            "CommitCommentEvent" : "Commit Comment",
            "ReleaseEvent"       : "Release",
            "PublicEvent"        : "Repository made public",
            "MemberEvent"        : "Membership change",
            "IssueCommentEvent"  : "Issue comment"
        };

        return {
            restrict: "A",
            require: "^ngModel",
            scope : {
                ngModel: '='
            },
            template: '',
            link: function(scope, element, attrs) {
                element.addClass("octicon");
                element.addClass("octicon-"+octiconMap[scope.ngModel]);
                element.attr("data-toggle", "tooltip");
                element.attr("data-placement", "left");
                element.attr("title",eventDescriptionMap[scope.ngModel]);
                $(element).tooltip();
            }
        };

    });

    app.controller("EventController", ["$http","$log", function($http,$log) {


    }]);

})();
