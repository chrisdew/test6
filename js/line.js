/**
 * A line connects two points.
 * 
 * @param {V} begin
 * @param {V} end
 */
function Line(begin, end) {
	if (this === window) {
		return new Line(begin, end);
	}
	this.begin = begin;
	this.end = end;
}


Line.prototype.rot_about = function(r, p) {
	return new Line(this.begin.rot_about(r, p), this.end.rot_about(r, p))
}

/**
 * returns the point at proportion 'a' between begin and end 
 * @param {number} a - between 0.0 and 1.0
 */
Line.prototype.pos_along = function(a) {
	var b = 1-a;
	return new V(this.begin.x * a + this.end.x * b, this.begin.y * a + this.end.y * b)
}

var PARALLEL = "PARALLEL";
var COINCIDENT = "COINCIDENT";
var NOT_INTERSECTING = "NOT_INTERSECTING";
var INTERSECTING = "INTERSECTING";

Line.prototype.intersects = function(other_line) {
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

