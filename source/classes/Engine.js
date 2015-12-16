HexAPI.Engine = function(){
  this._init();
};

HexAPI.Engine.prototype = {
  _init : function(){
    this.EVEN =  1;
    this.ODD = -1;
    this._createLayout();
    this._createDirections();
    this._createDiagonals();
  },

  _createLayout : function(){
    this.LAYOUT = {
      POINTY : this._orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5),
      FLAT : this._orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0)
    };
  },
  _createDirections : function(){
    this.DIRECTIONS = [this._hex(1, 0, -1), this._hex(1, -1, 0), this._hex(0, -1, 1,true), this._hex(-1, 0, 1), this._hex(-1, 1, 0), this._hex(0, 1, -1)];
  },

  _createDiagonals : function(){
    this.DIAGONALS = [this._hex(2, -1, -1), this._hex(1, -2, 1), this._hex(-1, -1, 2), this._hex(-2, 1, 1), this._hex(-1, 2, -1), this._hex(1, 1, -2)];
  },

  _hex : function(q,r,s){
     return {q: q, r: r, s: s};
  },

  _point : function(x,y){
    return {x:x, y:y};
  },

  _hexAdd : function(a,b){
    return this._hex(a.q + b.q, a.r + b.r, a.s + b.s);
  },

  _hexSubtract : function(a,b){
    return this._hex(a.q - b.q, a.r - b.r, a.s - b.s);
  },

  _hexScale : function(a,k){
    return this._hex(a.q * k, a.r * k, a.s * k);
  },

  _direction : function(d){
    return this.DIRECTIONS[d];
  },

  _diagonal : function(d){
    return this.DIAGONALS[d];
  },

  distanceBetween : function(hexA,hexB){
    return (
      Math.abs(hexA.q - hexB.q) +
      Math.abs(hexA.q+hexA.r-hexB.q-hexB.r) +
      Math.abs(hexA.r-hexB.r)
    )/2;
  },

  neighborAtDirection: function(hex, direction){
    return this._hexAdd(hex,this._direction(direction));
  },

  neighborsAtDiagonal : function(hex, direction){
    var n = this._diagonal(direction);
    return this._hexAdd(hex, n);
  },

  _orientation: function(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
    return {f0: f0, f1: f1, f2: f2, f3: f3, b0: b0, b1: b1, b2: b2, b3: b3, start_angle: start_angle};
  },


  createLayout : function(hexSize, origin, orientation) {

    if(orientation == 'pointy'){
      orientation = this.LAYOUT.POINTY;
    } else {
      orientation = this.LAYOUT.FLAT;
    }

    return {orientation: orientation, hexSize: hexSize, origin: origin};
  },

  centerOfHex : function(layout, hex){
    var M = layout.orientation;
    var hexSize = layout.hexSize;
    var origin = layout.origin;
    var x = (M.f0 * hex.q + M.f1 * hex.r) * hexSize.x;
    var y = (M.f2 * hex.q + M.f3 * hex.r) * hexSize.y;
    return this._point(x + origin.x, y + origin.y);
  },

  _roundToHex : function(hex){
    var q = Math.trunc(Math.round(hex.q));
    var r = Math.trunc(Math.round(hex.r));
    var s = Math.trunc(Math.round(hex.s));
    var q_diff = Math.abs(q - hex.q);
    var r_diff = Math.abs(r - hex.r);
    var s_diff = Math.abs(s - hex.s);
    if (q_diff > r_diff && q_diff > s_diff)
    {
        q = -r - s;
    }
    else
        if (r_diff > s_diff)
        {
            r = -q - s;
        }
        else
        {
            s = -q - r;
        }
    return this._hex(q, r, s);
  },

  _cornerOffset : function(layout,corner){
    var M = layout.orientation;
    var hexSize = layout.hexSize;
    var angle = 2.0 * Math.PI * (corner + M.start_angle) / 6;
    return this._point(hexSize.x * Math.cos(angle), hexSize.y * Math.sin(angle));
  },

  cornersOfHex : function(layout, h){
    var corners = [];
    var center = this.centerOfHex(layout, h);
    for (var i = 1; i <= 6; i++){
        l = i;
        if(l === 6){
          l = 0;
        }
        var offset = this._cornerOffset(layout, i);
        corners.push(this._point(center.x + offset.x, center.y + offset.y));
    }
    return corners;
  },

  hexAtPoint : function(layout, p){
    var M = layout.orientation;
    var hexSize = layout.hexSize;
    var origin = layout.origin;
    var pt = new this._point((p.x - origin.x) / hexSize.x, (p.y - origin.y) / hexSize.y);
    var q = M.b0 * pt.x + M.b1 * pt.y;
    var r = M.b2 * pt.x + M.b3 * pt.y;
    var frHex = this._hex(q, r, -q - r);//results in a fractional hex thus rounding
    return this._roundToHex(frHex);
  },

  getHexesWithinDistance : function(hex,dist){
    var results = [{q:hex.q,r:hex.r,s:hex.s}];
    for(var i = 1; i <= dist; i++){
      var n = this.getHexesAtDistance(hex,i);
      for(var l = 0; l < n.length; l++){
        results.push(n[l]);
      }
    }
    return results;
  },

  getHexesAtDistance : function(hex,dis){
    var results = [];
    var pHex = this._hexAdd(hex,this._hexScale(this._direction(4), dis));
    for(var i = 0; i < 6; i++){
      for(var j = 0; j < dis; j++){
        results.push(pHex);
        pHex = this.neighborAtDirection(pHex,i);
      }
    }
    return results;
  },

  _hexLerp : function(a, b, t){
    return this._hex(a.q+(b.q-a.q)*t, a.r+(b.r-a.r)*t, a.s+(b.s-a.s)*t);
  },

  _defineLineBetweenHexes : function(a, b){
    var N = this.distanceBetween(a, b);
    var results = [];
    var step = 1.0 / Math.max(N, 1);
    for (var i = 0; i <= N; i++) {
      var l = this._hexLerp(a, b, step*i);
      results.push(this._roundToHex(l));
    }
    return results;
  },

  checkIfLinesIntersect: function(l1,l2){
    var line1StartX, line1StartY, line1EndX, line1EndY, line2StartX,
		line2StartY, line2EndX, line2EndY, denominator, a, b, numerator1,
		numerator2, result = false;

    line1StartX = l1[0].x;
    line1StartY = l1[0].y;
    line1EndX = l1[1].x;
    line1EndY = l1[1].y;

    line2StartX = l2[0].x;
    line2StartY = l2[0].y;
    line2EndX = l2[1].x;
    line2EndY = l2[1].y;

    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) -
      ((line2EndX - line2StartX) * (line1EndY - line1StartY));

    if (denominator === 0) {
      return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1 && b > 0 && b < 1) {
        result = true;
    }
    return result;
  }

};
