//declare canvas and context objects
var c;
var ctx;
$("#canvas").ready(function () {
	c = $("#canvas").get(0);
	ctx = c.getContext("2d");
	//start the main game loop
	gameLoop();
});

graphObjs = [];
collideObjs = [];

function render() {
	//load next frame
	//clear frame
	ctx.clearRect(0,0, c.width, c.height);
	ctx.fillStyle = "#373737";
	ctx.fillRect(0, 0, c.width, c.height);
}

//the main game loop
function gameLoop() {
	window.requestAnimationFrame(gameLoop);
	render();
}