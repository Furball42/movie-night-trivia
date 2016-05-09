
var QuizController = function ($scope, $http, $location, QuizService) {

    //user vars
    $scope.username = "";
    $scope.sessionID = "";
    $scope.isConnected = false;    
    $scope.totalCorrect = 0;
    $scope.totalIncorrect = 0;
    $scope.score = 0;
    $scope.isCompleted = false;
    $scope.connID = "";

    //p2 vars
    $scope.p2IsConnected = false;
    $scope.p2Score = 0;
    $scope.p2ConnID = "";
    $scope.p2Name = "";

    //ui management vars
    $scope.showQuiz = false;
    $scope.showConn = false;
    $scope.showReg = true;
    $scope.inLimbo = false;
    $scope.isDisabled = false;
    $scope.disableNext = false;
    $scope.isReady = false;
    $scope.p2Ready = false;
    $scope.hasWon = false;
    $scope.tied = false;
    $scope.showLoading = false;

    //ui
    //input limitation for years only
    $scope.limitKeypress = function ($event, value, maxLength) {
        if (value != undefined && value.toString().length >= maxLength) {
            $event.preventDefault();
        }
    }

    //server hub
    $scope.gameHub = null; // holds the reference to hub
    $scope.gameHub = $.connection.gameHub; // initializes hub
    
    $.connection.hub.logging = true;
    //start hub connection and save uid
    $.connection.hub.start().done(function () {
        $scope.connID = $.connection.hub.id;
    });
    
    //hub events
    //player ready
    $scope.gameHub.client.broadcastReady = function (msg, score) {
        if (msg == "ready")
        {
            $scope.ready2Player(score);
        }
    }

    //player 2 joined
    $scope.gameHub.client.broadcastSession = function (sessionID, connID, p2Name) {        

        if ($scope.sessionID == sessionID)
        {
            $scope.setupPlayer2(connID, p2Name);
        }
    }

    //player 1 acknowleges player 2 and sends details
    $scope.gameHub.client.broadcastAcknowledge = function (p2ConnID, p2Name) {
        $scope.hostConnected(p2ConnID, p2Name);
    }

    //send ready signal to hub
    $scope.sendReady = function () {
        // sends a new message to the server
        $scope.gameHub.server.sendReadyMsg($scope.username, $scope.score, $scope.p2ConnID);
    }    

    //events
    //create session
    $scope.createSession = function (username) {

        $scope.username = username;
        
        var UID = Math.random().toString(36).substr(2, 4);
        $scope.sessionID = UID.toUpperCase();
        $scope.inLimbo = true;
        $scope.showReg = false;

    }

    //join sesssion
    $scope.joinSession = function () {
        $scope.gameHub.server.joinSession($scope.sessionID, $scope.connID, $scope.username);
        $scope.isConnected = true;
        $scope.showConn = false;
        $scope.startQuiz($scope.username);
    }

    //show enter sessionid
    $scope.showConnectionView = function() {
        $scope.showConn = true;
        $scope.showReg = false;
    }

    //start quiz
    $scope.startQuiz = function (username) {

        $scope.showLoading = true;
        $scope.isDisabled = true;
        $scope.username = username;

        QuizService.getMovies()
         .success(function (data) {
             $scope.showLoading = false;
             //movie vars
             $scope.movies = data;
             $scope.totalQuestions = $scope.movies.length;
             $scope.currentQuestion = 1;
             $scope.moviesPerPage = 1;                                      

             $scope.$watch('currentQuestion + moviesPerPage', function () {
                 var start = (($scope.currentQuestion - 1) * $scope.moviesPerPage),
                   end = start + $scope.moviesPerPage;

                 $scope.filteredMovies = $scope.movies.slice(start, end);
             });

             if ($scope.totalQuestions > 0)
             {
                 $scope.showQuiz = true;
                 $scope.showConn = false;
             }                 
         });
    }

    //select 'submit' per question
    $scope.onSelect = function (movie) {

        $scope.disableNext = true;

        if ($scope.isCompleted == false) {
            if (movie.Answer == movie.Year) {
                movie.IsCorrect = true;
                $scope.totalCorrect = $scope.totalCorrect + 1;
            }
            else {
                $scope.totalIncorrect = $scope.totalIncorrect + 1;
            }

            $scope.calculatePoints();
            $scope.isReady = true;
            $scope.sendReady();
        }

        if ($scope.isReady && $scope.p2Ready)
        {
            $scope.isReady = false;
            $scope.p2Ready = false;
            $scope.disableNext = false;

            if ($scope.currentQuestion < $scope.totalQuestions)
                $scope.currentQuestion++;
            else {                

                if ($scope.score > $scope.p2Score)
                {
                    $scope.hasWon = true;
                    $scope.tied = false;
                }
                else if ($scope.score == $scope.p2Score) {
                    $scope.tied = true;
                }
                else {
                    $scope.hasWon = false;
                    $scope.tied = false;
                }

                $scope.isCompleted = true;
            }
        }        
    }

    //set ready flag for 2P
    $scope.ready2Player = function (incP2Score) {
        $scope.p2Ready = true;
        $scope.disableNext = false;
        $scope.p2Score = incP2Score;

        $scope.$apply();

        if ($scope.isReady && $scope.p2Ready) {
            $scope.isReady = false;
            $scope.p2Ready = false;
            $scope.disableNext = false;
            $scope.$apply();

            if ($scope.currentQuestion < $scope.totalQuestions)
                $scope.currentQuestion++;
            else {

                if ($scope.score > $scope.p2Score) {
                    $scope.hasWon = true;
                    $scope.tied = false;
                }
                else if ($scope.score == $scope.p2Score) {
                    $scope.tied = true;
                }
                else {
                    $scope.hasWon = false;
                    $scope.tied = false;
                }

                $scope.isCompleted = true;
            }

            $scope.$apply();
        }
    }

    //setup player 2 details
    $scope.setupPlayer2 = function (connectionID, p2Name) {

        $scope.p2ConnID = connectionID;
        $scope.p2IsConnected = true;
        $scope.p2Name = p2Name;
        $scope.isConnected = true;        
        $scope.inLimbo = false;
        $scope.showConn = false;

        $scope.$apply();

        $scope.gameHub.server.acknowledgeConnection($scope.connID, connectionID, $scope.username);

        $scope.startQuiz($scope.username);
    }

    //setup host details (acknowledgement)
    $scope.hostConnected = function (p2connID, p2Name) {
        $scope.p2ConnID = p2connID;
        $scope.p2Name = p2Name;
        $scope.$apply();
    }

    //do points calc
    $scope.calculatePoints = function () {

        $scope.score = ($scope.totalCorrect * 5) - ($scope.totalIncorrect * 3);
        if ($scope.score < 0)
            $scope.score = 0;
    }

    //return to start
    $scope.reset = function () {
        location.reload();
    }

}

QuizController.$inject = ['$scope', '$http', '$location', 'QuizService'];
app.controller('QuizController', QuizController);
