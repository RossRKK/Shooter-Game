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
var bullets = [];
var level = {};

//object to track the mouse's position
var mouse = {
	x: 0,
	y: 0
}

//which keys are pressed
var w = false;
var a = false;
var s = false;
var d = false;

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
var test2;

function init() {
	//adding graphical objects
	//title bar rectangle
	titleBar = {
		type: "menu",
		top: 0,
		left: 0,
		width: c.width,
		height: 60,
		colour: "#000000"
	};
	graphObjs.push(titleBar);

	//left side bar rectangle
	leftBar = {
		type: "menu",
		top: titleBar.height,
		left: 0,
		width: 180,
		height: c.height - titleBar.height,
		colour: "#545454"
	};
	graphObjs.push(leftBar);

	//game window
	gameWin = {
		type: "rect", //not menu so that it is rendered before the bullets
		top: titleBar.height,
		left: leftBar.width,
		width: c.width - 180 - leftBar.width,
		height: c.height - titleBar.height - 120,
		colour: "#F1F1F1"
	};
	graphObjs.unshift(gameWin);

	//right side bar rectangle
	rightBar = {
		type: "menu",
		top: titleBar.height,
		left: gameWin.width + gameWin.left,
		width: c.width - (gameWin.width + gameWin.left),
		height: c.height - titleBar.height,
		colour: "#545454"
	};
	graphObjs.push(rightBar);

	//bottom bar rectangle
	bottomBar = {
		type: "menu",
		top: gameWin.height + gameWin.top,
		left: leftBar.width,
		width: c.width - leftBar.width - rightBar.width,
		height: c.height - (gameWin.height + gameWin.top),
		colour: "#242424"
	};
	graphObjs.push(bottomBar);

	//load level json
	$.getJSON('levels/level.json', function (response) {
		level = response;
		//add collideObjs
		collideObjs = level.collideObjs;
		//add collideobjs to graphobjs array
		level.collideObjs.forEach(function (obj){
			graphObjs.splice(graphObjs.indexOf(gameWin) + 1, 0, obj);
		});


		title = {
			type: "text",
			font: "30px Arial",
			colour: "#FFFFFF",
			textAlign: "center",
			text: level.title,
			x: titleBar.left + titleBar.width/2,
			y: titleBar.top + titleBar.height/2 + 10
		}
		graphObjs.push(title);
	});

	//player icon
	player = {
		type: "img",
		top: gameWin.top + (gameWin.height/2),
		left: gameWin.left + (gameWin.width/2),
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
		vy: 0,
		speed: 0.2,
		fire: function () {
			bullet = {
				type: "bullet",
				angle: player.angle,
				dist: 10,
				width: 5,
				height: 10,
				colour: "#555555",
				x: player.left,
				y: player.top,
				orgX: player.left,
				orgY: player.top,
				speed: 5
			}
			if (player.ammo > 0) {;
				bullets.push(bullet);
				player.ammo --;
			}
		},
		ammo: 16,
		health: 100,
		charge: 100,
		efficiency: 100,
		weight: 100
	}
	graphObjs.push(player);

	//declaring the dimensions of the players hit box
	hitbox = {
		top: player.top - 5,
		left: player.left - 5,
		bottom: player.top + player.height - 15,
		right: player.left + player.width - 15
	}

	//status bars
	//health bar
	healthBarBack = {
		type: "stat",
		colour: "#FFFFFF",
		height: 40,
		width: 200,
		top: gameWin.height + gameWin.top + 20,
		left: leftBar.left + leftBar.width + 100
	}
	graphObjs.push(healthBarBack);

	healthBar = {
		type: "stat",
		colour: "#AA0000",
		height: 40,
		width: player.health * 2,
		top: gameWin.height + gameWin.top + 20,
		left: leftBar.left + leftBar.width + 100
	}
	graphObjs.push(healthBar);

	healthLabel = {
		type: "text",
		font: "30px Arial",
		colour: "#FFFFFF",
		textAlign: "center",
		text: "Health",
		x: healthBar.left - 50,
		y: healthBar.top + healthBar.height/2 + 10
	}
	graphObjs.push(healthLabel);

	chargeBarBack = {
		type: "stat",
		colour: "#FFFFFF",
		height: 40,
		width: 200,
		top: gameWin.height + gameWin.top + 20,
		left: rightBar.left - 220
	}
	graphObjs.push(chargeBarBack);

	chargeBar = {
		type: "stat",
		colour: "#FFFF00",
		height: 40,
		width: player.charge * 2,
		top: gameWin.height + gameWin.top + 20,
		left: rightBar.left - 220
	}
	graphObjs.push(chargeBar);

	chargeLabel = {
		type: "text",
		font: "30px Arial",
		colour: "#FFFFFF",
		textAlign: "center",
		text: "Charge",
		x: chargeBar.left - 55,
		y: chargeBar.top + chargeBar.height/2 + 10
	}
	graphObjs.push(chargeLabel);

	weight = {
		type: "text",
		font: "30px Arial",
		colour: "#FFFFFF",
		textAlign: "center",
		text: "Weight: " + player.weight + "kg",
		x: healthBar.left + 50,
		y: healthBar.top + healthBar.height + 40
	}
	graphObjs.push(weight);

	efficiency = {
		type: "text",
		font: "30px Arial",
		colour: "#FFFFFF",
		textAlign: "center",
		text: "Efficiency: " + player.efficiency + "%",
		x: chargeBar.left + 50,
		y: chargeBar.top + chargeBar.height + 40
	}
	graphObjs.push(efficiency);

	//mouse movement event listener
	//sets mouse x and y coordinates
	$(window).mousemove(function (e) {
		mouse.x = getMousePos(e).x;
		mouse.y = getMousePos(e).y;
	});

	//onclick event listener
	//calls an elements clicked function
	$(window).click(function (e) {
		mouse.x = getMousePos(e).x;
		mouse.y = getMousePos(e).y;
		
		clicked = false;
		//Collision detetction
		clickObjs.forEach(function(element) {
			if (mouse.y > element.top && y < element.top + element.height
				&& mouse.x > element.left && x < element.left + element.width) {
				//if element is clicked
				element.clicked(element);
				clicked = true;
			}
		});
		
		if (!clicked) {
			player.fire();
		}
	});

	$(window).keydown(function (event) {
		if (event.keyCode == 87 && !w) {
			w = true;
		}
		if (event.keyCode == 65 && !a) {
			a = true;
		}
		if (event.keyCode == 83 && !s) {
			s = true;
		}
		if (event.keyCode == 68 && !d) {
			d = true;
		}
	});

	$(window).keyup(function (event) {
		if (event.keyCode == 87 && w) {
			w = false;
		}
		if (event.keyCode == 65 && a) {
			a = false;
		}
		if (event.keyCode == 83 && s) {
			s = false;
		}
		if (event.keyCode == 68 && d) {
			d = false;
		}
	});
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
		//ensure the object is within the game window
		if (obj.top < gameWin.top + gameWin.height && obj.top + obj.height > gameWin.top &&
			obj.left + obj.width > gameWin.left && obj.left < gameWin.left + gameWin.width) {
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
			if (graphObjs.indexOf(obj) == graphObjs.indexOf(gameWin)) {
				bullets.forEach(function (obj) {
					//save the unmidified canvas
					ctx.save();
					//translate the canvas to the objects position
					ctx.translate(obj.orgX, obj.orgY);
					//roatate the object at the correct angle
					ctx.rotate(obj.angle);
					//draw the bullet
					ctx.fillStyle = obj.colour;
					ctx.fillRect(- obj.width/2, - obj.height/2 - obj.dist, obj.width, obj.height);
					//restore the canavs to its original state
					ctx.restore();
				});
			}
		}
		if (obj.type == "menu") {
			//draw a rectangle with the correct colour and dimensions
			ctx.fillStyle = obj.colour;
			ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
		}
		if (obj.type == "stat") {
			//draw a rectangle with the correct colour and dimensions
			ctx.fillStyle = obj.colour;
			ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
		}
		if (obj.type == "text") {
			ctx.font = obj.font;
			ctx.fillStyle = obj.colour;
			ctx.textAlign = obj.textAlign;

			ctx.fillText(obj.text, obj.x, obj.y);
		}
	});
}

function updateStats() {
	//set efficiency based on health and weight
	player.efficiency = player.health - (player.weight - 100);
	//set speed based on efficiency
	player.speed = player.efficiency/200;
	//update the statis bars
	healthBar.width = player.health * 2;
	chargeBar.width = player.charge * 2;
	efficiency.text = "Efficiency: " + player.efficiency + "%"
	weight.text = "Weight: " + player.weight + "kg"
}


//the main game loop
function gameLoop() {
	window.requestAnimationFrame(gameLoop);
	//calculate the angle that the player should face
	player.angle = -Math.atan2((player.left - player.width/2) - mouse.x, (player.top - player.height/2) - mouse.y);

	//resistance
	player.vx = player.vx * 0.9;
	player.vy = player.vy * 0.9;
	if (player.vx < 0.1 && player.vx > -0.1) {
		player.vx = 0;
	}
	if (player.vy < 0.1 && player.vy > -0.1) {
		player.vy = 0;
	}

	//control inputs
	if (w && player.charge > 0) {
		player.vy += player.speed;
	}
	if (a && player.charge > 0) {
		player.vx += player.speed;
	}
	if (s && player.charge > 0) {
		player.vy -= player.speed;
	}
	if (d && player.charge > 0) {
		player.vx -= player.speed;
	}
	//drain charge if the player is moving
	if((w || a || s || d) && player.charge > 0) {
		player.charge -= 1/player.efficiency;
	}

	//speed limiting
	if (player.vy < -10) {
		player.vy = -10;
	}
	if (player.vy > 10) {
		player.vy = 10;
	}
	if (player.vx < -10) {
		player.vx = -10;
	}
	if (player.vx > 10) {
		player.vx = 10;
	}

	//move bullets
	bullets.forEach(function (obj) {
		obj.dist += obj.speed;

		//move point of bullet origin when the player moves
		obj.orgX += player.vx;
		obj.orgY += player.vy;

		//calculate bullets x and y cooridnates
		obj.x = (Math.sin(obj.angle) * obj.dist) + obj.orgX;
		obj.y = obj.orgY - (Math.cos(obj.angle) * obj.dist);
		//delete the bullet if it collides with something
		collideObjs.forEach(function (i) {
			if (obj.x > i.left && obj.x < i.left + i.width && obj.y > i.top && obj.y < i.top + i.height) {
				bullets.splice(bullets.indexOf(obj), 1);
			}
		});
	});

	//collisions code
	collideObjs.forEach(function (obj) {
		if (obj.left + obj.width > hitbox.left && obj.left < hitbox.right && obj.top + obj.height > hitbox.top && obj.top < hitbox.bottom) {
			player.vy = -player.vy;
			player.vx = -player.vx;
		}
	});

	//move collidable objects
	collideObjs.forEach(function (obj) {
		//move objects
		obj.left += player.vx;
		obj.top += player.vy;
	});

	updateStats();
	render();
}