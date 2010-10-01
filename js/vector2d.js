var DEGREES_270 = 3 * Math.PI / 4;
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


