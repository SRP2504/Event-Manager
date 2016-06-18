var ADMIN_NAME = "admin";
var ADMIN_PASS = "hello";
var app = angular.module('app', ['ui.calendar']);
app.controller('controller', ['$scope', '$compile', function ($scope, $compile) {
	$scope.user = JSON.parse (localStorage.getItem("user"));
	$scope.loginScreen = ($scope.user == undefined);
	$scope.eventsScreen = (($scope.user != undefined) && ($scope.user.username != ADMIN_NAME));
	$scope.adminScreen = (($scope.user != undefined) && ($scope.user.username == ADMIN_NAME));
	
	$scope.loginUser = {username: "", password: ""};
	$scope.registerUser = {firstName: "", lastName: "", username: "", password: ""};
	
	$scope.modalEvent = {id: "", title: "", start: "", end: ""};

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
		
		$scope.modalEvent = {id: "", title: "", start: "", end: ""};
		
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

	function increaseEventId () {
		localStorage.setItem("eventId", parseInt(localStorage.getItem("eventId"))+1);
	}

	function setStartAndEnd () {
		$scope.modalEvent.start = $scope.modalEvent.startDate.toLocaleDateString();
		if ($scope.modalEvent.startTime == undefined && $scope.modalEvent.endDate == undefined) {
			$scope.modalEvent.allDay = true;
		} else if ($scope.modalEvent.startTime != undefined) {
			$scope.modalEvent.start += " " + $scope.modalEvent.startTime.getHours()
									+ ":" + $scope.modalEvent.startTime.getMinutes();
			$scope.modalEvent.allDay = false;
		}

		if ($scope.modalEvent.endDate != undefined) {
			if ($scope.modalEvent.startTime == undefined) {
				$scope.modalEvent.start += " 00:00";
			}
			$scope.modalEvent.allDay = false;
			$scope.modalEvent.end = $scope.modalEvent.endDate.toLocaleDateString();
			if ($scope.modalEvent.endTime != undefined) {
				$scope.modalEvent.end += " " + $scope.modalEvent.endTime.getHours()
									+ ":" + $scope.modalEvent.endTime.getMinutes();
			}
		}
	}

	$scope.saveEventMethod = function () {
		var events = JSON.parse (localStorage.getItem("events"));
		if (events[$scope.user.username] == undefined) {
			events[$scope.user.username] = [];
		}
		setStartAndEnd ();
		$scope.modalEvent.id = localStorage.getItem("eventId");
		increaseEventId();
		events[$scope.user.username].push ($scope.modalEvent);
		localStorage.setItem("events", JSON.stringify(events));
		$scope.modalEvent = {id: "", title: "", start: "", end: ""};
		loadEvents($scope.user.username);
		$("#EventModal").modal("hide");
		location.reload();
	}

	$scope.updateEventMethod = function () {
		var events = JSON.parse (localStorage.getItem("events"));
		if (events[$scope.user.username] == undefined) {
			events[$scope.user.username] = [];
		}
		var userEvents = events[$scope.user.username];
		setStartAndEnd ();
		var i = 0;
		for (i = 0; i < userEvents.length; i++) {
			if (userEvents[i].id == $scope.modalEvent.id) {
				break;
			}
		}
		if (i < userEvents.length) {
			userEvents[i].title = $scope.modalEvent.title;
			userEvents[i].start = $scope.modalEvent.start;
			userEvents[i].end = $scope.modalEvent.end;
			userEvents[i].startTime = $scope.modalEvent.startTime;
			userEvents[i].startDate = $scope.modalEvent.startDate;
			userEvents[i].endTime = $scope.modalEvent.endTime;
			userEvents[i].endDate = $scope.modalEvent.endDate;
			userEvents[i].allDay = $scope.modalEvent.allDay;
		} else {
			/* Boom */
		}
		events[$scope.user.username] = userEvents;
		localStorage.setItem("events", JSON.stringify(events));
		$scope.modalEvent = {id: "", title: "", start: "", end: ""};
		loadEvents($scope.user.username);
		$("#EventModal").modal("hide");
		location.reload();
	}

	$scope.deleteEventMethod = function () {
		var events = JSON.parse (localStorage.getItem("events"));
		if (events[$scope.user.username] == undefined) {
			events[$scope.user.username] = [];
		}
		var userEvents = events[$scope.user.username];
		var i = 0;
		for (i = 0; i < userEvents.length; i++) {
			if (userEvents[i].id == $scope.modalEvent.id) {
				break;
			}
		}
		if (i < userEvents.length) {
			userEvents.splice(i, 1);
		} else {
			/* Boom */
		}
		events[$scope.user.username] = userEvents;
		localStorage.setItem("events", JSON.stringify(events));
		$scope.modalEvent = {id: "", title: "", start: "", end: ""};
		loadEvents($scope.user.username);
		$("#EventModal").modal("hide");
		location.reload();
	}
	
	function loadEvents (username) {
		$scope.events = [(JSON.parse (localStorage.getItem("events")))[username]];
	}

  	$scope.showEventModal = function () {
  		$scope.modalHeader = "Add Event";
  		$scope.modalButton = "Save";
  		$("#EventModal").modal();
  	}

    $scope.alertOnEventClick = function( event, jsEvent, view){
    	$scope.modalEvent = event;
    	$scope.modalEvent.startDate = new Date ($scope.modalEvent.startDate);
    	if ($scope.modalEvent.startTime != undefined)
    		$scope.modalEvent.startTime = new Date ($scope.modalEvent.startTime);
    	if ($scope.modalEvent.endDate != undefined)
    		$scope.modalEvent.endDate = new Date ($scope.modalEvent.endDate);
    	if ($scope.modalEvent.endTime != undefined)
    		$scope.modalEvent.endTime = new Date ($scope.modalEvent.endTime);
    	
    	$scope.modalHeader = "Update Event";
  		$scope.modalButton = "Update";
    	$("#EventModal").modal("show");
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
			height: 500,
			editable: true,
			eventLimit: 4,
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