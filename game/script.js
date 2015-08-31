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
var clickObjs = [];

var mouse = {
	x: 0,
	y: 0
}

var titleBar;
var leftBar;
var gameWin;
var rightBar;
var bottomBar;
var player;

function init() {
	//adding graphical objects
	//title bar rectangle
	titleBar = {
		type: "rect",
		top: 0,
		left: 0,
		width: c.width,
		height: 60,
		colour: "#000000"
	};
	graphObjs.push(titleBar);

	//left side bar rectangle
	leftBar = {
		type: "rect",
		top: titleBar.height,
		left: 0,
		width: 180,
		height: c.height - titleBar.height,
		colour: "#545454"
	};
	graphObjs.push(leftBar);

	//game window
	gameWin = {
		type: "rect",
		top: titleBar.height,
		left: leftBar.width,
		width: c.width - 180 - leftBar.width,
		height: c.height - titleBar.height - 120,
		colour: "#F1F1F1"
	};
	graphObjs.push(gameWin);

	//right side bar rectangle
	rightBar = {
		type: "rect",
		top: titleBar.height,
		left: gameWin.width + gameWin.left,
		width: c.width - (gameWin.width + gameWin.left),
		height: c.height - titleBar.height,
		colour: "#545454"
	};
	graphObjs.push(rightBar);

	//bottom bar rectangle
	bottomBar = {
		type: "rect",
		top: gameWin.height + gameWin.top,
		left: leftBar.width,
		width: c.width - leftBar.width - rightBar.width,
		height: c.height - (gameWin.height + gameWin.top),
		colour: "#242424"
	};
	graphObjs.push(bottomBar);

	//player icon
	player = {
		type: "img",
		top: gameWin.top + (gameWin.height/2) - 10,
		left: gameWin.left + (gameWin.width/2) - 10,
		width: 20,
		height: 20,
		source: "player.png",
		img: new Image(),
		loaded: false,
		load: function () {
			player.img.src = player.source;
			player.img.onload = function () {
				player.loaded = true;
			}
		},
		angle: Math.PI
	}
	graphObjs.push(player);

	//mouse movement event listener
	//sets mouse x and y coordinates
	c.addEventListener('mousemove', function(e) {
		mouse.x = getMousePos(e).x;
		mouse.y = getMousePos(e).y;
	});

	//onclick event listener
	//calls an elements clicked function
	c.addEventListener('click', function(e) {
		mouse.x = getMousePos(e).x;
		mouse.y = getMousePos(e).y;
		
		//Collision detetction
		clickObjs.forEach(function(element) {
			if (mouse.y > element.top && y < element.top + element.height
				&& mouse.x > element.left && x < element.left + element.width) {
				//if element is clicked
				element.clicked(element);
			}
		});
	}, false);
}

//function that calculates the mouses actual position on the canvas
function getMousePos(e) {
    var rect = c.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
}

function render() {
	//load next frame
	//clear frame
	ctx.clearRect(0,0, c.width, c.height);

	//draw each graphical object
	graphObjs.forEach(function (obj) {
		if (obj.type == "rect") {
			ctx.fillStyle = obj.colour;
			ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
		} else if (obj.type == "img") {
			obj.load();
			if (obj.loaded) {
				ctx.save();
				ctx.translate(obj.left, obj.top);
				ctx.rotate(obj.angle);
				ctx.drawImage(obj.img, -obj.width/2, -obj.height/2, obj.width, obj.height);
				ctx.restore();
			}
		}
	});
}

//the main game loop
function gameLoop() {
	window.requestAnimationFrame(gameLoop);

	player.angle = -Math.atan2((player.left - player.width/2) - mouse.x, (player.top - player.height/2) - mouse.y);

	render();
}