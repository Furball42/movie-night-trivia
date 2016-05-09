var app = angular.module("MNTApp", ["ngRoute"])
.config(["$routeProvider", function ($routeProvider) {

    $routeProvider
        .when("/quiz",
        { templateUrl: "/App/views/quiz.html" })
        .when("/index",
        { templateUrl: "/App/views/index.html" })
        .otherwise(
        { redirectTo: "/index" });

}]);