/*
 * Shapes are closed shapes composed of lines.  They need not be convex.
 * 
 * The convention is that clockwise shapes are filled and that
 * counter-clockwise shapes are voids.
 */

function Shape(points) {
	this.points = points;
	this.lines = [];
	for (i in points) {
		if (i < points.length - 1) {
			this.lines.push(Line(points[i], points[i+1]));
		} else {
			this.lines.push(Line(points[i], points[0]));
		}
	}	
}

Shape.prototype.debugToCanvas = function(canvasId) {
	var ctx = display.element.getContext("2d");
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	ctx.strokeStyle = '#aaaaaa';
	ctx.lineWidth   = 1;
	for (var i in this.points)
	ctx.moveTo();
	ctx.lineTo(x, (display.size.y / 3 + 2*size));
	ctx.stroke();		

}
