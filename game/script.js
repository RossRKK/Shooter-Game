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
var enemies = [];
var consumables = [];

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

//the players player
var player;

function loadImg(obj) {
	obj.img = new Image();
	obj.img.src = obj.source;
	obj.img.onload = function () {
		obj.loaded = true;
	}
}

function init() {
	//adding graphical objects
	//title bar rectangle
	titleBar = {
		type: "menu",
		top: 0,
		left: 0,
		width: c.width,
		height: 60,
		colour: "#527A7A"
	};
	graphObjs.push(titleBar);

	//left side bar rectangle
	leftBar = {
		type: "menu",
		top: titleBar.height,
		left: 0,
		width: 180,
		height: c.height - titleBar.height,
		colour: "#AEAEAE"
	};
	graphObjs.push(leftBar);

	//game window
	gameWin = {
		type: "rect", //not menu so that it is rendered before the bullets
		top: titleBar.height,
		left: leftBar.width,
		width: c.width - 180 - leftBar.width,
		height: c.height - titleBar.height - 120,
		colour: "#F5F5F5"
	};
	graphObjs.unshift(gameWin);

	//right side bar rectangle
	rightBar = {
		type: "menu",
		top: titleBar.height,
		left: gameWin.width + gameWin.left,
		width: c.width - (gameWin.width + gameWin.left),
		height: c.height - titleBar.height,
		colour: "#AEAEAE"
	};
	graphObjs.push(rightBar);

	//bottom bar rectangle
	bottomBar = {
		type: "menu",
		top: gameWin.height + gameWin.top,
		left: leftBar.width,
		width: c.width - leftBar.width - rightBar.width,
		height: c.height - (gameWin.height + gameWin.top),
		colour: "#55807B"
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

		//load the enemies array
		enemies = level.enemies;
		//add all enemies to the collideObjs array
		collideObjs = collideObjs.concat(enemies);

		//load the consumables array
		consumables = level.consumables;

		//add consumables to the graphobjs array
		level.consumables.forEach(function (obj){
			graphObjs.splice(graphObjs.indexOf(gameWin) + 1, 0, obj);
		});

		//add enemeies to the graphobjs array
		level.enemies.forEach(function (obj){
			graphObjs.splice(graphObjs.indexOf(gameWin) + 1, 0, obj);
		});

		title = {
			type: "text",
			font: "30px Palatino Linotype",
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
		source: "textures/player.png",
		img: new Image(),
		loaded: false,
		angle: Math.PI,
		vx: 0,
		vy: 0,
		speed: 0.2,
		fire: function () {
			bullet = {
				type: "bullet",
				angle: player.angle,
				dist: 25,
				width: 5,
				height: 10,
				colour: "#555555",
				x: player.left,
				y: player.top,
				orgX: player.left + player.width/2,
				orgY: player.top + player.height/2,
				speed: 5
			}
			if (player.ammo > 0) {;
				bullets.push(bullet);
				player.ammo --;
			}
		},
		ammo: 16,
		maxAmmo: 16,
		health: 100,
		maxHealth: 100,
		charge: 100,
		maxCharge: 100,
		efficiency: 100,
		weight: 100,
		normalizedX: 0,
		normalizedY: 0
	}
	graphObjs.push(player);

	//status bars
	//health bar
	healthBarBack = {
		type: "stat",
		colour: "#B80000",
		height: 40,
		width: 200,
		top: gameWin.height + gameWin.top + 20,
		left: leftBar.left + leftBar.width + 100
	}
	graphObjs.push(healthBarBack);

	healthBar = {
		type: "stat",
		colour: "#900000",
		height: 40,
		width: player.health * 2,
		top: gameWin.height + gameWin.top + 20,
		left: leftBar.left + leftBar.width + 100
	}
	graphObjs.push(healthBar);

	healthLabel = {
		type: "text",
		font: "30px Palatino Linotype",
		colour: "#FFFFFF",
		textAlign: "center",
		text: "Health",
		x: healthBar.left - 50,
		y: healthBar.top + healthBar.height/2 + 10
	}
	graphObjs.push(healthLabel);

	chargeBarBack = {
		type: "stat",
		colour: "#FFE680",
		height: 40,
		width: 200,
		top: gameWin.height + gameWin.top + 20,
		left: rightBar.left - 220
	}
	graphObjs.push(chargeBarBack);

	chargeBar = {
		type: "stat",
		colour: "#FFCC00",
		height: 40,
		width: player.charge * 2,
		top: gameWin.height + gameWin.top + 20,
		left: rightBar.left - 220
	}
	graphObjs.push(chargeBar);

	chargeLabel = {
		type: "text",
		font: "30px Palatino Linotype",
		colour: "#FFFFFF",
		textAlign: "center",
		text: "Charge",
		x: chargeBar.left - 55,
		y: chargeBar.top + chargeBar.height/2 + 10
	}
	graphObjs.push(chargeLabel);

	weight = {
		type: "text",
		font: "30px Palatino Linotype",
		colour: "#FFFFFF",
		textAlign: "center",
		text: "Weight: " + player.weight + "kg",
		x: healthBar.left + 50,
		y: healthBar.top + healthBar.height + 40
	}
	graphObjs.push(weight);

	efficiency = {
		type: "text",
		font: "30px Palatino Linotype",
		colour: "#FFFFFF",
		textAlign: "center",
		text: "Efficiency: " + player.efficiency + "%",
		x: chargeBar.left + 50,
		y: chargeBar.top + chargeBar.height + 40
	}
	graphObjs.push(efficiency);

	gunIcon = {
		type: "img",
		top: gameWin.top + gameWin.height,
		left: rightBar.left + rightBar.width/2 - 32,
		width: 64,
		height: 64,
		source: "textures/guns/pistol.png",
		img: new Image(),
		loaded: false,
		load: function () {
			gunIcon.img.src = gunIcon.source;
			gunIcon.img.onload = function () {
				gunIcon.loaded = true;
			}
		},
		angle: 0
	}
	graphObjs.push(gunIcon);

	//mouse movement event listener
	//sets mouse x and y coordinates
	$(window).mousemove(function (e) {
		mouse.x = getMousePos(e).x;
		mouse.y = getMousePos(e).y;
	});

	//onclick event listener
	//calls an elements clicked function
	$("#canvas").click(function (e) {
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

	var options = {
		left: {
			type: "joystick",
			position: {
				left: '8%',
				bottom: '15%'
			},
			joystick: {
				touchMove: function (details) {
					player.normalizedX = details.normalizedX;
					player.normalizedY = details.normalizedY;
				}
			}
		},
		right: {
			type: "buttons",
			buttons: [
			{
				label: "fire", fontSize: 13, offset: {x: '8%', y: '7%'}, touchStart: player.fire
			}, false, false, false]
		}
	}
	if ('ontouchstart' in window || navigator.msMaxTouchPointst) {
		GameController.init(options);
	}
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
		if (obj.top < c.height && obj.top + obj.height > 0 &&
			obj.left + obj.width > 0 && obj.left < c.width) {
			if (obj.type == "rect") {
				//draw a rectangle with the correct colour and dimensions
				ctx.fillStyle = obj.colour;
				ctx.fillRect(obj.left, obj.top, obj.width, obj.height);
			} else if (obj.type == "img") {
				if (!obj.loaded) {
					loadImg(obj);
				}
				if (obj.loaded) {
					//save the unmidified canvas
					ctx.save();
					//translate the canvas to the objects position
					ctx.translate(obj.left + obj.width/2, obj.top + obj.height/2);
					//roatate the object at the correct angle
					ctx.rotate(obj.angle);
					//draw the player icon
					ctx.drawImage(obj.img, -obj.width/2, -obj.height/2, obj.width, obj.height);
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

	//draw ammo bar
	tHeight = gameWin.height - 80;
	width = 40;
	height = tHeight/((player.maxAmmo * 2) - 1);
	for (var i = 0; i < player.maxAmmo * 2; i = i + 2) {
		ctx.fillStyle = "#939393";
		ctx.fillRect(rightBar.left + rightBar.width/2 - width/2, gameWin.top + 40 + height * i, width, height);
	}

	for (var i = 1; i < player.ammo * 2; i = i + 2) {
		ctx.fillStyle = "#F5F5F5";
		ctx.fillRect(rightBar.left + rightBar.width/2 - width/2, gameWin.top + gameWin.height - 40 - (height * i), width, height);
	}
}

function updateStats() {
	//set efficiency based on health and weight
	player.efficiency = player.health - (player.weight - 100);
	//set speed based on efficiency
	player.speed = player.efficiency/200;
	//update the statis bars
	healthBar.width = healthBarBack.width - (player.maxHealth - player.health) * (healthBarBack.width/player.maxHealth);
	chargeBar.width = chargeBarBack.width - (player.maxCharge - player.charge) * (chargeBarBack.width/player.maxCharge);
	efficiency.text = "Efficiency: " + player.efficiency + "%";
	weight.text = "Weight: " + player.weight + "kg";
}

var iterator = 0;
//the main game loop
function gameLoop() {
	window.requestAnimationFrame(gameLoop);
	//calculate the angle that the player should face
	if ('ontouchstart' in window || navigator.msMaxTouchPointst) { //if touch screen
		player.angle = Math.atan2(player.normalizedX, player.normalizedY);
	} else {
		player.angle = -Math.atan2(player.left - mouse.x, player.top - mouse.y);
	}

	//resistance
	player.vx = player.vx * 0.9;
	player.vy = player.vy * 0.9;
	if (player.vx < 0.1 && player.vx > -0.1) {
		player.vx = 0;
	}
	if (player.vy < 0.1 && player.vy > -0.1) {
		player.vy = 0;
	}
	//movement for joystick
	player.vx -= player.normalizedX * player.speed;
	player.vy += player.normalizedY * player.speed;

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
	if((player.vy > 0 || player.vx > 0) && player.charge > 0) {
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
		//damge the enemy and remove the bullet if they collide
		enemies.forEach(function (i) {
			if (obj.x > i.left && obj.x < i.left + i.width && obj.y > i.top && obj.y < i.top + i.height) {
				bullets.splice(bullets.indexOf(obj), 1);
				i.health -= 100;
			}
		});

		//damge the player if hit by a bullet
		if (obj.x > player.left && obj.x < player.left + player.width && obj.y > player.top && obj.y < player.top + player.height) {
			bullets.splice(bullets.indexOf(obj), 1);
			player.health -= 10;
		}
	});

	//collisions code
	collideObjs.forEach(function (obj) {
		if (obj.left + obj.width > player.left && obj.left < player.left + player.width && obj.top + obj.height > player.top && obj.top < player.top + player.height) {
			player.vy = -player.vy;
			player.vx = -player.vx;
		}
	});

	//consumables collisions
	consumables.forEach(function (obj) {
		if (obj.left + obj.width > player.left && obj.left < player.left + player.width && obj.top + obj.height > player.top && obj.top < player.top + player.height) {
			if (obj.resource == "health") {
				player.health += obj.supply;
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				consumables.splice(consumables.indexOf(obj), 1);
				graphObjs.splice(graphObjs.indexOf(obj), 1);
			} else if (obj.resource == "charge") {
				player.charge += obj.supply;
				if (player.charge > player.maxCharge) {
					player.charge = player.maxCharge;
				}
				consumables.splice(consumables.indexOf(obj), 1);
				graphObjs.splice(graphObjs.indexOf(obj), 1);
			} else if (obj.resource == "ammo") {
				player.ammo += obj.supply;
				if (player.ammo > player.maxAmmo) {
					player.ammo = player.maxAmmo;
				}
				consumables.splice(consumables.indexOf(obj), 1);
				graphObjs.splice(graphObjs.indexOf(obj), 1);
			} 
		}
	});

	//enemy patrols
	enemies.forEach(function (obj) {
		if (obj.pType != null) {
			if (obj.health <= 0) {
				enemies.splice(enemies.indexOf(obj), 1);
				graphObjs.splice(graphObjs.indexOf(obj), 1);
				collideObjs.splice(graphObjs.indexOf(obj), 1);
			}
			//calculate the distance from the enemy to the player
			playerDist = Math.sqrt(Math.pow(player.top + player.height/2 - obj.top + obj.height/2, 2) + Math.pow(player.left + player.width/2 - obj.left + obj.width/2, 2));
			//calculate the angle from the enemy to the player
			playerAngle = -Math.atan2((obj.left - obj.width/2) - player.left + player.width/2, (obj.top - obj.height/2) - player.top + player.height/2);
			//do this as many times as the objects speed is
			for (var i = 0; i < obj.speed; i++) {
				if (obj.patroling) {
					//move the object towards the waypoint
					if (obj.left + obj.width/2 < obj.pWays[obj.curWay].x) {
						obj.left ++;
					} else if (obj.left + obj.width/2 > obj.pWays[obj.curWay].x) {
						obj.left --;
					}
					if (obj.top + obj.height/2 < obj.pWays[obj.curWay].y) {
						obj.top ++;
					} else if (obj.top + obj.height/2 > obj.pWays[obj.curWay].y) {
						obj.top --;
					}
					//if the object has reached its way point
					if (Math.round(obj.left + obj.width/2) == Math.round(obj.pWays[obj.curWay].x) && Math.round(obj.top + obj.height/2) == Math.round(obj.pWays[obj.curWay].y)) {
						//if the patrol type is loop change to correct waypoint
						if(obj.pType == "loop") {
							obj.curWay = (obj.curWay + 1) % obj.pWays.length;
						}
						//get the new angle the enemy points (exactly the same as the way we get the direction the player points)
						obj.angle = -Math.atan2(obj.left - obj.pWays[obj.curWay].x, obj.top - obj.pWays[obj.curWay].y);
					}
				} else {
					//move the enemy towards the player if the enemey is further than 50px away
					if (playerDist > 75) {
						if (obj.left + obj.width/2 < player.left + player.width/2) {
							obj.left ++;
						} else if (obj.left + obj.width/2 > player.left + player.width/2) {
							obj.left --;
						}
						if (obj.top + obj.height/2 < player.top + player.height/2) {
							obj.top ++;
						} else if (obj.top + obj.height/2 > player.top + player.height/2) {
							obj.top --;
						}
					}
					//set enemy angle towards player
					obj.angle = playerAngle;
				}
			}
		}

		//if the player is within the enemies view
		if (playerDist < obj.range && playerAngle - obj.angle < obj.rangeAng) {
			obj.patroling = false;
			if (iterator % obj.fireRate == 0) {
				bullet = {
					type: "bullet",
					angle: obj.angle,
					dist: 30,
					width: 5,
					height: 10,
					colour: "#555555",
					x: obj.left,
					y: obj.top,
					orgX: obj.left + obj.width/2,
					orgY: obj.top + obj.height/2,
					speed: 5
				}
				bullets.push(bullet);
			}
		} else {
			obj.patroling = true;
		}
	});

	//update positions
	updatePos(collideObjs);
	updatePos(consumables);
	//move waypoints in enemiy objects objects
	enemies.forEach(function (obj) {
		obj.pWays.forEach(function (i) {
			i.x += player.vx;
			i.y += player.vy;
		});
	});

	updateStats();
	render();
	iterator ++;
}

function updatePos(arr) {
	arr.forEach(function (obj) {
		//move objects
		obj.left += player.vx;
		obj.top += player.vy;
	});
}