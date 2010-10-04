/*
 * Shapes are closed shapes composed of lines.  They need not be convex.
 * 
 * The convention is that clockwise shapes are filled and that
 * counter-clockwise shapes are voids.
 */

function Shape(points) {
	if (this === window) {
		return new Shape(points);
	}
	this.points = points;
}

Shape.prototype.getLines = function() {
	this.lines = [];
	for (i in points) {
		if (i < points.length - 1) {
			this.lines.push(Line(points[i], points[i+1]));
		} else {
			this.lines.push(Line(points[i], points[0]));
		}
	}	
	return lines;
}

/**
 * This calculates a point on the line 'viewpoint -> next_point' such
 * that it is 'length' away from viewpoint.
 * 
 * @param {V} viewpoint
 * @param {V} next_point
 * @param {Number} length
 */
function project(viewpoint, next_point, length) {
	var dx = next_point.x - viewpoint.x;
	var dy = next_point.y - viewpoint.y;
	var dl = Math.sqrt(dx*dx + dy*dy);
	return new V(viewpoint.x + length/dl * dx, viewpoint.y + length/dl * dy);
}

Shape.prototype.getShadowShapes = function(view_point, shadow_length) {
	var vp = view_point;
	var sl = shadow_length;
	
	var shadows = [];
	var last_index = this.points.length - 1;
	//var i = 0;
	for (var i in this.points) {
		// add the two shadow points which coincide with this shape
		var points = [this.points[last_index], this.points[i]];
		points.push(project(vp, this.points[i], sl)); 
		points.push(project(vp, this.points[last_index], sl)); 
		shadows.push(Shape(points));
		last_index = i;
	}
	console.log(shadows);
	return shadows;
	
}

Shape.prototype.debugToCanvas = function() {
	var element = document.getElementById('display');
	var ctx = element.getContext("2d");
	//ctx.canvas.width  = window.innerWidth;
	//ctx.canvas.height = window.innerHeight;
	ctx.save();
	ctx.translate(400, 200);
	ctx.strokeStyle = '#aaaaaa';
	ctx.lineWidth   = 1;
	ctx.moveTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
	for (var i in this.points) {
		ctx.lineTo(this.points[i].x, this.points[i].y);
	}
	ctx.stroke();		
	ctx.restore();

}
