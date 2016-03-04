function app() {

	var timeSampler;
	var backgroundPage = chrome.extension.getBackgroundPage();

	var editableLength = 20;
	var project = {};

	getStoredParams();

	outputTime('#time1', parseTime(project.time1));
	outputTime('#time2', parseTime(project.time2));
	$('#timerName1').text(project.timerName1);
	$('#timerName2').text(project.timerName2);
	$('#projectName').text(project.name);

	// add click events
	$('#switch-button').click(function () {
		toggleCounter();
	});

	$('#reset').click(function () {
		resetTimers();
		app();
	});

//	$('.default-gradient').css({
//		'background': 'linear-gradient(135deg, ' + project.color1 + ' 33%, ' + project.color2 + ' 66%)'
//	});
//	$('.green-text').css({
//		'color': project.color1
//	});
//
//	$('.blue-text').css({
//		'color': project.color2
//	});
	
	// define gradient colors on the fly
	$('head').append('<style>.default-gradient{background: linear-gradient(135deg, ' + project.color1 + ' 33%, ' + project.color2 + ' 66%)}.green-text{color: '+project.color1+'}.blue-text{color:'+project.color2+'}.green {background-size: 100px 420px;background-position: 0 0;}.blue {background-size: 100px 420px;background-position: 0 -280px;}</style>')

	makeEditable(['timerName1', 'timerName2', 'projectName']);

	// get parameters from the local storage

	function getStoredParams() {
		project = backgroundPage.getProject();
		project.color1 = '#00ffc0';
		project.color2 = '#00eaff';
		project.time1 = parseInt(localStorage.time1) || 0;
		project.time2 = parseInt(localStorage.time2) || 0;
		project.togglePosition = localStorage.togglePosition || 0;
		project.timerName1 = localStorage.timerName1 || "TIMER 1";
		project.timerName2 = localStorage.timerName2 || "TIMER 2";
		project.name = localStorage.projectName || "NEW PROJECT";
		if (project.togglePosition != "") {
			autoStartCounter();
		}
	}

	function autoStartCounter() {
		if (project.togglePosition == "left") {
			moveLeft();
		} else {
			moveRight();
		}
		startTimeSampler();
	};

	function toggleCounter() {
		var timeElapsed = parseInt(localStorage.timeElapsed) || 0;
		outputTime('#switch-counter', '--:--:--');
		startTimeSampler();
		resetBackgroundTimer();
		startBackgroundTimer();
		if (project.togglePosition == "right" || "") {
			moveRight();
			storeTime('1', timeElapsed)
		} else {
			moveLeft();
			storeTime('2', timeElapsed)
		}
		console.log(project.togglePosition);
		console.log("+++", project.time1, project.time2, timeElapsed);
	};

	function storeTime(playerNumber, increment) {
		if (playerNumber == '1') {
			project.time1 = project.time1 + increment;
			localStorage.time1 = project.time1;
			moveRight();
			outputTime("#time1", parseTime(project.time1));
		} else {
			project.time2 = project.time2 + increment;
			localStorage.time2 = project.time2;
			moveLeft();
			outputTime("#time2", parseTime(project.time2));
		}
	}

	function updateTime() {
		outputTime('#switch-counter', parseTime(parseInt(localStorage.timeElapsed) || 0));
	}

	function parseTime(millisec) {
		var seconds = Math.floor(millisec / 1000) % 60;
		var minutes = Math.floor(millisec / (1000 * 60)) % 60;
		var hours = Math.floor(millisec / (1000 * 60 * 60)) % 24;
		if (seconds < 10) {
			secondsStr = "0" + seconds;
		} else {
			secondsStr = "" + seconds;
		}
		if (minutes < 10) {
			minutesStr = "0" + minutes;
		} else {
			minutesStr = "" + minutes;
		}
		if (hours < 10) {
			hoursStr = "0" + hours;
		} else {
			hoursStr = "" + hours;
		}
		return hoursStr + ":" + minutesStr + ":" + secondsStr;
	}

	function resetTimers() {
		localStorage.time1 = 0;
		localStorage.time2 = 0;
		localStorage.togglePosition = "";
		outputTime('#switch-counter', 'Start');
		moveToCenter();
		stopTimeSampler();
		resetBackgroundTimer();
	}

	// save data on close

	$(window).unload(function () {
		backgroundPage.saveProject(project);
	});

	// text edit

	function makeEditable(elementIdNames) {
		var temporaryName;
		var originalColor;
		$.each(elementIdNames, function (i, v) {
			$('#' + v).focus(function () {
				temporaryName = $(this).text();
				originalColor = $(this).css('color');
				$(this).css('color', '#222').text("");
			}).blur(function () {
				$(this).css('color', originalColor);
				if ($(this).text() != "") {
					var text = $(this).text().substring(0, editableLength);
					localStorage[v] = text;
				} else {
					$(this).text(temporaryName)
				};
				$('[tabIndex=1]').focus();
			}).keydown(function (e) {
				if (e.keyCode === 13) {
					e.preventDefault();
					$(this).blur();
				}
			});
		});
	}


	//UI functions

	function outputTime(elem, time) {
		$(elem).text(time);
	}

	function moveLeft() {
		var element = $('#switch-button');
		element.css({
			'left': '3px'
		});
		element.parent().removeClass('blue').addClass('green');
		$('#switch-counter').css({
			'color': project.color1
		});
		project.togglePosition = "right";
		localStorage.togglePosition = "left";
		$('#switch-button').find('.tooltip-inner').text("Click to switch timer");
		backgroundPage.setBadgeBackgroundColor({ color:project.color1 });
	}

	function moveRight() {
		var element = $('#switch-button');
		element.css({
			'left': '25px'
		});
		element.parent().removeClass('green').addClass('blue');
		$('#switch-counter').css({
			'color': project.color2
		});
		project.togglePosition = "left";
		localStorage.togglePosition = "right";
		$('#switch-button').find('.tooltip-inner').text("Click to switch timer");
		backgroundPage.setBadgeBackgroundColor({ color:project.color2 });
	}

	function moveToCenter() {
		$("#switch-button").css({
			'left': '15px'
		});
		$("#switch-button").parent().removeClass().addClass('default-gradient');
		$('#switch-counter').css({
			'color': project.color1
		});
		$('#switch-button').find('.tooltip-inner').text("Click to start timer");
	}

	// time sampler

	function startTimeSampler() {
		timeSampler = setInterval(function () {
			updateTime();
		}, 100);
	}

	function stopTimeSampler() {
		clearInterval(timeSampler);
		timeSampler = null;
	}

	// bacground timer

	function startBackgroundTimer() {
		backgroundPage.startTimer()
	}

	function resetBackgroundTimer() {
		backgroundPage.resetTimer();
	}

}

$(window).load(app);