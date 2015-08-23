//declare canvas and context objects
$("#canvas").ready(function () {
	c = $("#canvas").get(0);
	ctx = c.getContext("2d");
	//start the main game loop
	init();
	gameLoop();
});

var collideObjs = [];
var graphObjs = [];

function init() {
	//adding graphical objects
	//title bar rectangle
	titleBar = {
		top: 0,
		left: 0,
		width: c.width,
		height: 60,
		colour: "#000000"
	};
	graphObjs.push(titleBar);

	//left side bar rectangle
	leftBar = {
		top: titleBar.height,
		left: 0,
		width: 180,
		height: c.height - titleBar.height,
		colour: "#545454"
	};
	graphObjs.push(leftBar);

	//game window
	gameWin = {
		top: titleBar.height,
		left: leftBar.width,
		width: c.width - 180 - leftBar.width,
		height: c.height - titleBar.height - 120,
		colour: "#F1F1F1"
	};
	graphObjs.push(gameWin);

	//right side bar rectangle
	rightBar = {
		top: titleBar.height,
		left: gameWin.width + gameWin.left,
		width: c.width - (gameWin.width + gameWin.left),
		height: c.height - titleBar.height,
		colour: "#545454"
	};
	graphObjs.push(rightBar);

	//bottom bar rectangle
	bottomBar = {
		top: gameWin.height + gameWin.top,
		left: leftBar.width,
		width: c.width - leftBar.width - rightBar.width,
		height: c.height - (gameWin.height + gameWin.top),
		colour: "#242424"
	};
	graphObjs.push(bottomBar);
}

function render() {
	//load next frame
	//clear frame
	ctx.clearRect(0,0, c.width, c.height);
	ctx.fillStyle = "#373737";
	ctx.fillRect(0, 0, c.width, c.height);

	//draw each graphical object
	graphObjs.forEach(function (obj) {
		ctx.fillStyle = obj.colour;
		ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
	});
}

//the main game loop
function gameLoop() {
	window.requestAnimationFrame(gameLoop);
	render();
}