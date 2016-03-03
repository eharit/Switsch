var startDate;
var timer;
var startNewTime = true;
var loadedProject = {};

function startTimer() {
	startDate = (startNewTime) ? new Date() : startDate;
	if (startNewTime) {
		timer = setInterval(bgProcess, 1000);
		startNewTime = false;
	} else {
		console.log("timer's already running");
	}
}

function resetTimer() {
	if (!startNewTime) {
		startNewTime = true;
		localStorage.timeElapsed = 0;
		clearInterval(timer);
		timer = null;
		chrome.browserAction.setBadgeText({text:parseTime(0)});
	} else {
		console.log("timer's already reseted");
	}
}

function saveProject(project) {
	console.log(project.name + " saved.");
	loadedProject = project;
}

function getProject() {
	console.log("Fake that " + loadedProject.name + " has been loaded.");
	project = loadedProject;
	return project;
}

function setBadgeBackgroundColor(color) {
	chrome.browserAction.setBadgeBackgroundColor(color);
}

function bgProcess() {
	var currentDate = new Date();
	var timeElapsed = Math.floor((currentDate - startDate) / 1000) * 1000;
	localStorage.timeElapsed = timeElapsed;
	console.log(parseInt(localStorage.timeElapsed));
	chrome.browserAction.setBadgeText({text:parseTime(timeElapsed)});
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
		return hoursStr + ":" + minutesStr;
	}