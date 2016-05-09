
var QuizService = function ($http) {
    var getMovies = function () {
        return $http.get('api/trivadata');
    };

    return {
        getMovies: getMovies
    };
};

app.factory("QuizService", QuizService);

