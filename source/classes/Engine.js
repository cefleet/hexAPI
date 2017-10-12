var Engine = (function(){
  /*
    private functions
  */

  var _hex = function(q,r,s){
     return {q: q, r: r, s: s};
  };

  var _point = function(x,y){
    return {x:x, y:y};
  };

  var _hexAdd = function(a,b){
    return _hex(a.q + b.q, a.r + b.r, a.s + b.s);
  };

  var _hexSubtract = function(a,b){
    return _hex(a.q - b.q, a.r - b.r, a.s - b.s);
  };

  var _hexScale = function(a,k){
    return _hex(a.q * k, a.r * k, a.s * k);
  };

  var _direction = function(d){
    return DIRECTIONS[d];
  };

  var _diagonal = function(d){
    return DIAGONALS[d];
  };

  var _orientation = function(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
    return {f0: f0, f1: f1, f2: f2, f3: f3, b0: b0, b1: b1, b2: b2, b3: b3, start_angle: start_angle};
  };

  var _roundToHex = function(hex){
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
    return _hex(q, r, s);
  };

  var _cornerOffset = function(layout,corner){
    var M = layout.orientation;
    var hexSize = layout.hexSize;
    var angle = 2.0 * Math.PI * (corner + M.start_angle) / 6;
    return _point(hexSize.x * Math.cos(angle), hexSize.y * Math.sin(angle));
  };

  var _hexLerp = function(a, b, t){
    return _hex(a.q+(b.q-a.q)*t, a.r+(b.r-a.r)*t, a.s+(b.s-a.s)*t);
  };

  var _defineLineBetweenHexes = function(a, b){
    var N = distanceBetween(a, b);
    var results = [];
    var step = 1.0 / Math.max(N, 1);
    for (var i = 0; i <= N; i++) {
      var l = _hexLerp(a, b, step*i);
      results.push(_roundToHex(l));
    }
    return results;
  };


  /*
    Public

  */

  var distanceBetween = function(hexA,hexB){
    return (
      Math.abs(hexA.q - hexB.q) +
      Math.abs(hexA.q+hexA.r-hexB.q-hexB.r) +
      Math.abs(hexA.r-hexB.r)
    )/2;
  };

  var neighborAtDirection = function(hex, direction){
    return _hexAdd(hex,_direction(direction));
  };

  var neighborsAtDiagonal = function(hex, direction){
    var n = _diagonal(direction);
    return _hexAdd(hex, n);
  };


  var createLayout = function(hexSize, origin, orientation) {

    if(orientation == 'pointy'){
      orientation = LAYOUT.POINTY;
    } else {
      orientation = LAYOUT.FLAT;
    }

    return {orientation: orientation, hexSize: hexSize, origin: origin};
  };

  var centerOfHex = function(layout, hex){
    var M = layout.orientation;
    var hexSize = layout.hexSize;
    var origin = layout.origin;
    var x = (M.f0 * hex.q + M.f1 * hex.r) * hexSize.x;
    var y = (M.f2 * hex.q + M.f3 * hex.r) * hexSize.y;
    return _point(x + origin.x, y + origin.y);
  };



  var cornersOfHex = function(layout, h){
    var corners = [];
    var center = centerOfHex(layout, h);
    for (var i = 1; i <= 6; i++){
        l = i;
        if(l === 6){
          l = 0;
        }
        var offset = _cornerOffset(layout, i);
        corners.push(_point(center.x + offset.x, center.y + offset.y));
    }
    return corners;
  };

  var hexAtPoint = function(layout, p){
    var M = layout.orientation;
    var hexSize = layout.hexSize;
    var origin = layout.origin;
    var pt = _point((p.x - origin.x) / hexSize.x, (p.y - origin.y) / hexSize.y);//this did have a new in front of point?
    var q = M.b0 * pt.x + M.b1 * pt.y;
    var r = M.b2 * pt.x + M.b3 * pt.y;
    var frHex = _hex(q, r, -q - r);//results in a fractional hex thus rounding
    return _roundToHex(frHex);
  };

  var getHexesWithinDistance = function(hex,dist){
    var results = [{q:hex.q,r:hex.r,s:hex.s}];
    for(var i = 1; i <= dist; i++){
      var n = getHexesAtDistance(hex,i);
      for(var l = 0; l < n.length; l++){
        results.push(n[l]);
      }
    }
    return results;
  };

  var getHexesAtDistance = function(hex,dis){
    var results = [];
    var pHex = _hexAdd(hex,_hexScale(_direction(4), dis));
    for(var i = 0; i < 6; i++){
      for(var j = 0; j < dis; j++){
        results.push(pHex);
        pHex = neighborAtDirection(pHex,i);
      }
    }
    return results;
  };


  var checkIfLinesIntersect = function(l1,l2){
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
  };

  /*
    Do Stuff
  */
  var LAYOUT = {
    POINTY : _orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5),
    FLAT : _orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0)
  };

  var DIRECTIONS =  [_hex(1, 0, -1), _hex(1, -1, 0), _hex(0, -1, 1,true), _hex(-1, 0, 1), _hex(-1, 1, 0), _hex(0, 1, -1)];
  var DIAGONALS = [_hex(2, -1, -1), _hex(1, -2, 1), _hex(-1, -1, 2), _hex(-2, 1, 1), _hex(-1, 2, -1), _hex(1, 1, -2)];

  /*
  return public
  */

  var funcs = {
    distanceBetween:distanceBetween,
    neighborAtDirection:neighborAtDirection,
    neighborsAtDiagonal:neighborsAtDiagonal,
    createLayout:createLayout,
    centerOfHex:centerOfHex,
    cornersOfHex:cornersOfHex,
    hexAtPoint:hexAtPoint,
    getHexesWithinDistance:getHexesWithinDistance,
    getHexesAtDistance:getHexesAtDistance,
    checkIfLinesIntersect:checkIfLinesIntersect
  };

  return funcs;

})();
