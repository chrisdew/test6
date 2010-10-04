var NORTH = Math.PI / 2;
var SOUTH = 3 * Math.PI / 4;
var EAST = 0;
var WEST = Math.PI;

var DEGREES_180 = Math.PI;
var DEGREES_90 = Math.PI / 2;
var DEGREES_60 = Math.PI / 3;
var DEGREES_30 = Math.PI / 6;

function V(x, y) {
	this.x = x;
	this.y = y;
}
V.prototype.add = function(v) {
	return new V(this.x + v.x, this.y + v.y);
}
V.prototype.sub = function(v) {
	return new V(this.x - v.x, this.y - v.y);
}
V.prototype.mul = function(m) {
	return new V(this.x * m, this.y * m);
}
V.prototype.modulus = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
}
/**
 * return a vector rotated r radians counter clockwise about the origin
 * @param {number} r radians
 */
V.prototype.rot = function(r) {
	return new V( this.x * Math.cos(r) + this.y * Math.sin(r)
				, this.y * Math.cos(r) - this.x * Math.sin(r) 
				) ;
}
/**
 * return a vector rotated r radians counter clockwise about p
 * @param {number} r radians
 */
V.prototype.rot_about = function(r, p) {
	return this.sub(p).rot(r).add(p);
}


function Sector(begin, end) {
	this.begin = begin;
	this.end = end;
}

Sector.prototype.rot_about = function(r, p) {
	return new Sector(this.begin.rot_about(r, p), this.end.rot_about(r, p))
}

/**
 * returns the point at proportion 'a' between begin and end 
 * @param {number} a - between 0.0 and 1.0
 */
Sector.prototype.pos_along = function(a) {
	var b = 1-a;
	return new V(this.begin.x * a + this.end.x * b, this.begin.y * a + this.end.y * b)
}

var PARALLEL = "PARALLEL";
var COINCIDENT = "COINCIDENT";
var NOT_INTERSECTING = "NOT_INTERSECTING";
var INTERSECTING = "INTERSECTING";

Sector.prototype.intersects = function(other_line) {
	var denom = ((other_line.end.y - other_line.begin.y)*(this.end.x - this.begin.x)) -
                ((other_line.end.x - other_line.begin.x)*(this.end.y - this.begin.y));
	var nume_a = ((other_line.end.x - other_line.begin.x)*(this.begin.y - other_line.begin.y)) -
                 ((other_line.end.y - other_line.begin.y)*(this.begin.x - other_line.begin.x));		
	var nume_b = ((this.end.x - this.begin.x)*(this.begin.y - other_line.begin.y)) -
                 ((this.end.y - this.begin.y)*(this.begin.x - other_line.begin.x));
	//console.log(denom, nume_a, nume_b);	
	if (denom === 0.0) {
        if(nume_a === 0.0 && nume_b === 0.0) {
            return { result: false, state: COINCIDENT };
        }
        return { result: false, state: PARALLEL };
    }			 		
	var ua = nume_a / denom;
    var ub = nume_b / denom; 
	//console.log(ua, ub);	
	if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0) {
        // Get the intersection point.
        //intersection.x_ = begin_.x_ + ua*(end_.x_ - begin_.x_);
        //intersection.y_ = begin_.y_ + ua*(end_.y_ - begin_.y_);

		return { result: new V( this.begin.x + ua*(this.end.x - this.begin.x)
		                      , this.begin.y + ua*(this.end.y - this.begin.y)
					          )
			   , state: INTERSECTING
			   , proportion: ua
			   , proportion_other: ub
			   }
    }
	return { result: false, state: NOT_INTERSECTING };
}

function ImageBank(callback) {
	this.texture = new Image();   // Create new Image object  
	this.texture.onload = callback;
    this.texture.src = 'brick_wall.jpg'; // Set source path
}



function Display(element) {
	console.log("Display", this);
	this.element = element;
	this.element.mozImageSmoothingEnabled = false;
	this.size = new V($(element).width(), $(element).height());
}

function Map(element) {
	console.log("Map", this);
	this.element = element;
	this.scale = 2.0;	// pixels per metre
	this.size = new V($(element).width(), $(element).height());
}
Map.prototype.pos_to_coords = function(v) {
	console.log("Map#pos_to_coords(", v, ")");
	var r = v.mul(this.scale).add(this.size.mul(0.5));
	console.log("r", r);
	return r;
}


function Camera(pos, rot, fov, range) {
	this.pos = pos;
	this.rot = rot;
	this.fov = fov;
	this.range = range;
	
	this.speed = 0;
	this.dir = 0;
}

Camera.prototype.update = function() {
	//console.log("rot", this.rot, "dir", this.dir, "pos", this.pos, "speed", this.speed);
	this.rot += this.dir;
	this.pos = this.pos.add(new V(this.speed,0).rot(this.rot));
}
/**
 * This returns a Sector which passes through a column in the display.
 * @param {number} column (0.0 - left, 1.0 - right)
 */
Camera.prototype.get_intersector = function(column) {
	//console.log("Camera#get_intersector(", column, ")");
	
	// memoise this	
	var range_sector = new Sector((new V(this.range,0)).rot(this.rot - this.fov/2), (new V(this.range,0)).rot(this.rot + this.fov/2));
	
	return new Sector(this.pos, range_sector.pos_along(column));	
}
Camera.prototype.safeDrawImage = function(tox,img,sx,sy,sw,sh,dx,dy,dw,dh) {
        if (!img||!tox) return;
        if (sx<0) { dx-=(dw/sw)*sx;sw+=sx; sx=0; }
        if (sy<0) { dy-=(dh/sh)*sy;sh+=sy; sy=0; }
        if (sx+sw>img.width) { dw=(dw/sw)*(img.width-sx);sw=img.width-sx;}
        if (sy+sh>img.height) { dh=(dh/sh)*(img.height-sy);sh=img.height-sy;}
        try { if ((sh>0)&&(sw>0)&&(sx<img.width)&&(sy<img.height)) tox.drawImage(img, sx,sy,sw,sh,dx,dy,dw,dh); } catch(e){}
}
Camera.prototype.render_display = function(display, walls, texture, res) {
	//console.log("Camera#render_display(", display, walls, ")");
	
	//display.element.width = display.element.width;
	var ctx = display.element.getContext("2d");
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	
	
	ctx.fillStyle = 'rgb(64,64,64)';
	ctx.fillRect(0, 0, display.size.x, display.size.y / 3);
	ctx.fillStyle = 'rgb(96,96,96)';
	ctx.fillRect(0, display.size.y / 3, display.size.x, display.size.y -1);
	
	
	//var self = this;
	//setTimeout(function() {
    //    console.log("ctx.drawImage(", self.texture, 0, 0, ")");
    //    ctx.drawImage(self.texture, 0, 0);
    //}, 3000);
	
	//ctx.strokeStyle = '#aaaaaa';
	//ctx.lineWidth   = 1;
	//var start = (new Date()).getMilliseconds();
	for (var x = 0; x < display.size.x; x += res) {
		var intersector = this.get_intersector((x) / display.size.x);
		var nearest_wall = null;
		var nearest_intersect = 1.0;
		for (var i in walls) {
			var wall = walls[i];
			var intersect = intersector.intersects(wall);
			if (!intersect.result) {
				continue;
			}
			if (nearest_wall === null || intersect.proportion < nearest_intersect.proportion) {
				nearest_wall = wall;
				nearest_intersect = intersect;
			}
		}
		//console.log(nearest_wall, nearest_intersect);
		if (nearest_wall != null) {
			var size = display.size.y / 2 * (0.1333333333333333 / nearest_intersect.proportion);
			//console.log(x, (display.size.y / 2 - size), display.size, size);
			//ctx.moveTo(x, (display.size.y / 3 - size));
			//ctx.lineTo(x, (display.size.y / 3 + 2*size));
			var top = display.size.y / 3 - size;
			this.safeDrawImage( ctx
			                  , texture
			                  , (texture.width - 1) * nearest_intersect.proportion_other //sx
					          , 0 //sy
					          , 1//res //sWidth
					          , texture.height //sHeight
					          , x //dx
					          , top //dy
					          , res //dWidth
					          , size * 3 //dHeight
					          ) ;
		}
	}
	//var end = (new Date()).getMilliseconds();
	//console.log("fps:", 1000.0 / (end - start));
	//ctx.stroke();		
	
}
Camera.prototype.render_map = function(map, walls) {
	console.log("Camera#render_map(", map, walls, ")");
	var ctx = map.element.getContext("2d");
	
	for(var i in walls) {
		wall = walls[i];
		var begin = map.pos_to_coords(wall.begin);
		var end = map.pos_to_coords(wall.end);
		//ctx.beginPath();
		ctx.strokeStyle = '#000000';
		ctx.lineWidth   = 1;
		ctx.moveTo(begin.x, begin.y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
		//ctx.closePath();
	}
	for (var i = 0.0; i <= 1.0; i++) {
		var sector = this.get_intersector(i);
		var begin = map.pos_to_coords(sector.begin);
		var end = map.pos_to_coords(sector.end);
		if (i === 0.0) {
			ctx.strokeStyle = '#0000ff';
		} else {
			ctx.strokeStyle = '#ff0000';			
		}
		ctx.lineWidth   = 1;
		ctx.moveTo(begin.x, begin.y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
	}
}


function Engine(display_id, map_id, callback) {
	console.log("Engine()", this);
	this.display = new Display(document.getElementById(display_id));
	this.map = new Map(document.getElementById(map_id));
	this.camera = new Camera(new V(0,0), NORTH, DEGREES_60, 30);
	this.walls = [ new Sector(new V(-3, -9), new V(+3, -9))
				 , new Sector(new V(-3, -3), new V(-3, -9))
				 ] ;
	this.MAX_SLOW_FRAME_COUNTER = 15;
	this.MIN_SLOW_FRAME_COUNTER = 0;
	this.slow_frame_counter = (this.MAX_SLOW_FRAME_COUNTER + this.MIN_SLOW_FRAME_COUNTER) / 2;
	this.MAX_RES = 15;
	this.MIN_RES = 1;
	this.resolution = (this.MAX_RES + this.MIN_RES) / 2;
				 
	this.bind_keys();
	this.set_resize();
	this.image_bank = new ImageBank(callback);
}

Engine.prototype.set_resize = function() {
	console.log("set_resize");
	var self = this;
	
	window.onload = window.onresize = function() {
		console.log("onResize");
    	var el = self.display.element;

    	// For IE compatibility http://www.google.com/search?q=get+viewport+size+js
    	var viewportWidth = window.innerWidth;
    	var viewportHeight = window.innerHeight;

    	var canvasWidth = viewportWidth;
    	var canvasHeight = viewportHeight;
    	el.style.position = "fixed";
    	el.setAttribute("width", canvasWidth);
    	el.setAttribute("height", canvasHeight);
		self.display.size = new V(canvasWidth, canvasHeight);
    	//el.style.top = (viewportHeight - canvasHeight) / 2;
    	//el.style.left = (viewportWidth - canvasWidth) / 2;

    	//window.ctx = el.getContext("2d");
    	//ctx.clearRect(0,0,canvasWidth,canvasHeight);
    	//ctx.fillStyle = 'yellow';
    	//ctx.moveTo(0, canvasHeight/2);
    	//ctx.lineTo(canvasWidth/2, 0);
    	//ctx.lineTo(canvasWidth, canvasHeight/2);
    	//ctx.lineTo(canvasWidth/2, canvasHeight);
    	//ctx.lineTo(0, canvasHeight/2);
    	//ctx.fill()
	}
}

// bind keyboard events to game functions (movement, etc)
Engine.prototype.bind_keys = function () {
	console.log("Engine::bind_keys", this);
	var self = this;
  document.onkeydown = function(e) {
    e = e || window.event;
      console.log("down e.keyCode", e.keyCode);
    switch (e.keyCode) { // which key was pressed?
      case 38: // up, move player forward, ie. increase speed
        self.camera.speed = 0.6; break;
      case 40: // down, move player backward, set negative speed
        self.camera.speed = -0.6; break;
      case 37: // left, rotate player left
        self.camera.dir = 0.03; break;
      case 39: // right, rotate player right
        self.camera.dir = -0.03; break;
    }
  }
  // stop the player movement/rotation when the keys are released
  document.onkeyup = function(e) {
    e = e || window.event;
      console.log("up e.keyCode", e.keyCode);
    switch (e.keyCode) {
      case 38:
      case 40:
        self.camera.speed = 0; break; 
      case 37:
      case 39:
        self.camera.dir = 0; break;
    }
  }
}
Engine.prototype.render_loop = function(fps){
	
	
	
	var start = (new Date()).getMilliseconds();
	this.camera.render_display(this.display, this.walls, this.image_bank.texture, this.resolution);
	//this.affine();
	var end = (new Date()).getMilliseconds();
	var self = this;
	var delay = 1000/fps - (end - start);
	if (delay < 2 || start > end) { delay = 2; }
	console.log("render delay", delay);
	
	if (delay <= 2) { // running slow
		this.slow_frame_counter--;
	}
	if (delay > 5) { // lots of spare cpu }
		this.slow_frame_counter++;
	}
	
	if (this.slow_frame_counter < this.MIN_SLOW_FRAME_COUNTER) {
		console.log("trying to decrease resolution");
		this.slow_frame_counter = (this.MAX_SLOW_FRAME_COUNTER + this.MIN_SLOW_FRAME_COUNTER) / 2;
		if (this.resolution < this.MAX_RES) {
			this.resolution++;
		}
	}
	if (this.slow_frame_counter > this.MAX_SLOW_FRAME_COUNTER) {
		console.log("trying to increase resolution");
		this.slow_frame_counter = (this.MAX_SLOW_FRAME_COUNTER + this.MIN_SLOW_FRAME_COUNTER) / 2;
		if (this.resolution > this.MIN_RES) {
			this.resolution--;
		}
	}
	
	setTimeout(function() { self.render_loop(fps) }, delay);
}

Engine.prototype.control_loop = function(fps){
	var start = (new Date()).getMilliseconds();
	this.camera.update();
	var end = (new Date()).getMilliseconds();
	var self = this;
	var delay = 1000/fps - (end - start);
	if (delay < 1 || start > end) { delay = 1; }
	//console.log("control delay", delay);
	setTimeout(function() { self.control_loop(fps) }, delay);
}


Engine.prototype.affine = function(fps){
	var ctx = this.display.element.getContext("2d");
	
	var h = this.image_bank.texture.height;
	var w = this.image_bank.texture.width;
	
	ctx.setTransform(1, 0, -0.2, 1, 0, 0);
	ctx.drawImage(this.image_bank.texture, 0, 0);

}

Engine.prototype.render_display = function(res) {
	//console.log("Engine#render_display()");
	this.camera.render_display(this.display, this.walls, this.image_bank.texture, res);
}

Engine.prototype.render_map = function() {
	console.log("Engine#render_map()");
	this.camera.render_map(this.map, this.walls);	
}
