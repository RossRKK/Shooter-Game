//declare canvas and context objects
$("#canvas").ready(function () {
	c = $("#canvas").get(0);
	ctx = c.getContext("2d");
	//start the main game loop
	init();
	gameLoop();
});

//various arrays of objects for gameplay
var collideObjs = [];
var graphObjs = [];
var clickObjs = [];

//object to track the mouse's position
var mouse = {
	x: 0,
	y: 0
}

//declaration of graphical objects
var titleBar;
var leftBar;
var gameWin;
var rightBar;
var bottomBar;
var player;

//the players hitbox
var hitbox;

//declaration of collidable objects
var test;

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
	graphObjs.unshift(gameWin);

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

	//declaration of collidable objects
	test = {
		type: "rect",
		top: 300,
		left: 300,
		width: 20,
		height: 20,
		colour: "#555555"
	}
	graphObjs.push(test);
	collideObjs.push(test);

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
		angle: Math.PI,
		vx: 0,
		vy: 0
	}
	graphObjs.push(player);

	//declaring the dimensions of the players hit box
	hitbox = {
		top: player.top - 5,
		left: player.left - 5,
		bottom: player.top + player.height - 10,
		right: player.left + player.width - 10,
	}

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
			//draw a rectangle with the correct colour and dimensions
			ctx.fillStyle = obj.colour;
			ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
		} else if (obj.type == "img") {
			obj.load();
			if (obj.loaded) {
				//save the unmidified canvas
				ctx.save();
				//translate the canvas to the objects position
				ctx.translate(obj.left, obj.top);
				//roatate the object at the correct angle
				ctx.rotate(obj.angle);
				//draw the player icon
				ctx.drawImage(obj.img, - obj.width/2, - obj.height/2, obj.width, obj.height);
				//restore the canavs to its original state
				ctx.restore();
			}
		}
	});
}

function xor(foo, bar) {
	return (foo && !bar) || (!foo && bar);
}

//the main game loop
function gameLoop() {
	window.requestAnimationFrame(gameLoop);

	//calculate the angle that the player should face
	player.angle = -Math.atan2((player.left - player.width/2) - mouse.x, (player.top - player.height/2) - mouse.y);

	//collisions code
	collideObjs.forEach(function (obj) {
		var overLapX = !(obj.left + obj.width < hitbox.left) && !(obj.left > hitbox.right);
		var overLapY = !(obj.top + obj.height < hitbox.top) && !(obj.top > hitbox.bottom);
		if (overLapX && overLapY) {
			player.vy = -0.5 * player.vy;
			player.vx = -0.5 * player.vx;
		}
	});

	//resistance
	player.vx = player.vx * 0.99;
	player.vy = player.vy * 0.99;
	if (player.vx < 0.001) {
		player.vx = 0;
	}
	if (player.vy < 0.01) {
		player.vy = 0;
	}

	//move collidable objects
	collideObjs.forEach(function (obj) {
		//move objects
		obj.left += player.vx;
		obj.top += player.vy;
	});

	render();
}