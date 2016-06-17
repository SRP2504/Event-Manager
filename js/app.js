var ADMIN_NAME = "admin";
var ADMIN_PASS = "hello";
var app = angular.module('app', ['ui.calendar']);
app.controller('controller', ['$scope', function ($scope) {
	$scope.user = JSON.parse (localStorage.getItem("user"));
	$scope.loginScreen = ($scope.user == undefined);
	$scope.eventsScreen = (($scope.user != undefined) && ($scope.user.username != ADMIN_NAME));
	$scope.adminScreen = (($scope.user != undefined) && ($scope.user.username == ADMIN_NAME));
	
	$scope.loginUser = {username: "", password: ""};
	$scope.registerUser = {firstName: "", lastName: "", username: "", password: ""};
	
	$scope.modalEvent = {id: "", title: "", description: "", date: "", start: "", end: ""};

	$scope.events = [];
	$scope.users = [];
	
	function switchScreen () {
		$scope.loginScreen = ($scope.user == undefined);
		$scope.eventsScreen = (($scope.user != undefined) && ($scope.user.username != ADMIN_NAME));
		$scope.adminScreen = (($scope.user != undefined) && ($scope.user.username == ADMIN_NAME));
	}
	
	function init () {
		var users = [];
		if (localStorage.getItem("users") != undefined) {
			users = JSON.parse (localStorage.getItem("users"));
		}
		if (users.length == 0) {
			users.push({firstName: "Admin", lastName: "", username: ADMIN_NAME, password: md5(ADMIN_PASS)});
		}
		localStorage.setItem("users", JSON.stringify(users));
		
		var events = {};
		if (localStorage.getItem("events") == undefined) {
			localStorage.setItem("events", JSON.stringify(events));
		}

		if (localStorage.getItem("eventId") == undefined) {
			localStorage.setItem("eventId", 0);
		}
	}
	init ();
	
	$scope.registerUserMethod = function () {
		var users = JSON.parse (localStorage.getItem("users"));
		$scope.registerUser.password = md5($scope.registerUser.password);
		users.push ($scope.registerUser);
		localStorage.setItem("users", JSON.stringify(users));
		
		$scope.registerUser = {firstName: "", lastName: "", username: "", password: ""};

		loadUsers();
	}
	
	$scope.loginUserMethod = function () {
		var users = JSON.parse (localStorage.getItem("users"));
		var user = undefined;
		var hashedPassword = md5($scope.loginUser.password);
		for (var i = 0; i < users.length; i++) {
			if (users[i].username == $scope.loginUser.username && users[i].password == hashedPassword) {
				user = users[i];
				break;
			}
		}
		if (user == undefined) {
			/* Boom happened */
		} else {
			localStorage.setItem ("user", JSON.stringify(user));
			$scope.user = user;
			if ($scope.user.username != ADMIN_NAME) {
				loadEvents ($scope.user.username);
			} else {
				loadUsers ();
			}
			switchScreen ();
		}
	}
	
	function loadUsers () {
		$scope.users = JSON.parse (localStorage.getItem("users"));
	}
	
	$scope.logout = function () {
		localStorage.removeItem ("user");
		$scope.user = localStorage.getItem("user");
		$scope.loginScreen = ($scope.user == undefined);
		$scope.eventsScreen = (($scope.user != undefined) && ($scope.user.username != ADMIN_NAME));
		$scope.adminScreen = (($scope.user != undefined) && ($scope.user.username == ADMIN_NAME));
		
		$scope.loginUser = {username: "", password: ""};
		$scope.registerUser = {firstName: "", lastName: "", username: "", password: ""};
		
		$scope.modalEvent = {name: "", description: "", date: "", start: "", end: ""};
		
		$scope.events = [];
		$scope.users = [];
	}

	$scope.loginPanel = function () {
		$("#login-form").delay(100).fadeIn(100);
 		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$("#login-form-link").addClass('active');
	}

	$scope.registerPanel = function () {
		$("#register-form").delay(100).fadeIn(100);
 		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$("#register-form-link").addClass('active');
	}

	if ($scope.eventsScreen) {
		loadEvents ($scope.user.username);
	}
	if ($scope.adminScreen) {
		loadUsers ();
	}

	function increaseEventId() {
		localStorage.setItem("eventId", parseInt(localStorage.getItem("eventId"))+1);
	}

	$scope.saveEventMethod = function () {
		var events = JSON.parse (localStorage.getItem("events"));
		if (events[$scope.user.username] == undefined) {
			events[$scope.user.username] = [];
		}
		if ($scope.modalEvent.start != undefined) {
			$scope.modalEvent.start = $scope.modalEvent.start.toLocaleTimeString();
		}
		if ($scope.modalEvent.end != undefined) {
			$scope.modalEvent.start = $scope.modalEvent.start.toLocaleTimeString();
		}
		return;
		$scope.modalEvent.id = localStorage.getItem("eventId");
		increaseEventId();
		events[$scope.user.username].push ($scope.modalEvent);
		localStorage.setItem("events", JSON.stringify(events));
		$scope.modalEvent = {id: "", title: "", description: "", date: "", start: "", end: ""};
		loadEvents($scope.user.username);
		$("#EventModal").modal("hide");
	}

	function eventsCompare(a, b) {
	  	if (a.date < b.date)
	    	return -1;
	  	if (a.date > b.date)
	    	return 1;
	  	return 0;
	}
	
	function loadEvents (username) {
		$scope.events = (JSON.parse (localStorage.getItem("events")))[username];
		if ($scope.events != undefined && $scope.events.length > 0) {
			$scope.events.sort (eventsCompare);
		}
	}

  	$scope.showEventModal = function () {
  		$scope.modalHeader = "Add Event";
  		$scope.modalButton = "Save";
  		$("#EventModal").modal();
  	}

  	$scope.open = function() {
    	$scope.popup.opened = true;
  	};

    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
    };
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    $scope.eventRender = function( event, element, view ) { 
        element.attr({'tooltip': event.title,
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
    };
  	$scope.uiConfig = {
		calendar:{
			height: 550,
			editable: true,
			eventLimit: true,
			header:{
		  		left: 'prev,next,today',
		  		center: 'title',
		  		right: 'month,basicWeek,basicDay'
			},
			eventClick: $scope.alertOnEventClick,
			eventDrop: $scope.alertOnDrop,
			eventResize: $scope.alertOnResize,
			eventRender: $scope.eventRender
		}
    };
	
}]);