var HexAPI = (function(){
//It is closed at the HexAPIEnd.js
//Is there a better way to do this?
  var setup = function(options){
    options = options || {};
    options.engine = Engine
    return new Grid(options);
  };

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

var Grid = function(options) {
  this._init(options);
};

Grid.prototype = {
  _init: function(options){
    this.engine = options.engine;
    options = options || {};
    this.hexSize = options.hexSize || {x:30,y:30};
    this.origion = options.origion || {x:0,y:0};
    this.orientation = options.orientation || 'pointy';

    this.layout = this.engine.createLayout(this.hexSize, this.origion, this.orientation);

    this.rows = options.rows || 30;
    this.cols = options.cols || 20;

    this._createMap();
  },

  getHexList: function(){
    return Object.keys(this.map);
  },

  getHexAtPoint : function(p){
    return this.engine.hexAtPoint(this.layout,p);
  },

  _createMap : function(){
    this.map = {};
    var r,q;
    if(this.orientation == 'pointy'){
      this._makePointyMap();
    } else {
      this._makeFlatMap();
    }
  },

  _makePointyMap : function(){
    for(r = 0; r < this.rows; r++){
      var r_offset = Math.floor(r/2);
      for(q = -r_offset; q < this.cols-r_offset; q++){
        var h = new HexAPI.Hex({q:q,r:r,s:-q-r,grid:this});
        this.map[h.id] = h;
      }
    }
  },

  _makeFlatMap : function(){
    for(q = 0; q < this.cols; q++){
      var q_offset = Math.floor(q/2);
      for(r = -q_offset; r < this.rows-q_offset; r++){
        var h = new HexAPI.Hex({q:q,r:r,s:-q-r,grid:this});
        this.map[h.id] = h;
      }
    }
  }

};

var Hex = function(options) {
  this._init(options);
};

Hex.prototype = {
  _init: function(options){
    this.grid = options.grid;
    this.engine = this.grid.engine;
    options = options || {};
    this.q = options.q || 0;
    this.r = options.r || 0;
    this.s = options.s || 0;
    //TODO Save Edges 

    this.id = this.q+'.'+this.r+'.'+this.s;
    this._setCenter();

    this._setCorners();

    this._setEdges();

    this._setNeighbors();

    this._setDiagonalNeighbors();
  },

  getNeighborAt : function(dir){
    return this.neighbors[dir];
  },

  getDistanceTo : function(hex){
      return this.engine.distanceBetween(this,hex);
  },

  getHexesWithinDistance : function(dist){
    return this.engine.getHexesWithinDistance(this,dist);
  },

  getHexesAtDistance : function(dist){
    return this.engine.getHexesAtDistance(this,dist);
  },

  makeHexLineTo : function(hex){
    return this.engine._defineLineBetweenHexes(this, hex);
  },

  makeStraightLineTo : function(hex){
    if(hex){
      return [this.centerPoint,hex.centerPoint];
    } else {
      return false;
    }
  },

  //TODO obstacles do nothing at this point but they will be the ones to ignore or remove from a list
  //TODO limit it to just a list to make it even smaller
  getPathTo : function(endHex,obstacles,list){
    var astarList = this._aStarGetPathTo(endHex,obstacles,list);
    var path = [];
    for(var i = 0; i < astarList.length; i++){
      path.push(this.grid.map[astarList[i].id]);
    }
    return path;
  },

//TODO I'm going to have to change this quite a bit.

  _aStarGetPathTo : function(endHex,obstacles,list){

    var i;

  //  if(!this._aStarGrid){
      this._astarGridSetup(obstacles,endHex);
  //  }
    var grid = this._aStarGrid;
    for(i = 0; i < grid.length; i++){
      if(grid[i].id === this.id){
        start = grid[i];
      }

      //right now if end is on an enemy it causes a problem
      if(grid[i].id === endHex.id){
        end = grid[i];
      }
    }

    var openList   = [];
		var closedList = [];
		openList.push(start);
    var heuristic = this._astarHeuristic;

    while(openList.length > 0) {

           // Grab the lowest f(x) to process next
           var lowInd = 0;
           for(i=0; i<openList.length; i++) {
              //TODO I don't know what f is
               if(openList[i].f < openList[lowInd].f) { lowInd = i; }
           }
           var currentNode = openList[lowInd];
           // End case -- result has been found, return the traced path
           //There is no parent
           if(currentNode == end) {
               var curr = currentNode;
               var ret = [];
               while(curr.parent) {
                   ret.push(curr);
                   curr = curr.parent;
               }
               return ret.reverse();
           }

           // Normal case -- move currentNode from open to closed, process each of its neighbors
          // openList.remove(lowInd);
          openList.splice(lowInd,1);
           currentNode.closed = true;

           for(i=0; i<currentNode.neighbors.length;i++) {

               var neighbor = this._getAstarGridItemFromId(currentNode.neighbors[i]);


               /*
               if(neighbor.closed || neighbor.isWall()) {
                   // not a valid node to process, skip to next neighbor
                   continue;
               }
               */
               //TODO this is another place we could have obstacles
               if(!neighbor || neighbor.closed || neighbor.isObstacle){
                 continue;
               }
               // g score is the shortest distance from start to current node, we need to check if
               //   the path we have arrived at this neighbor is the shortest one we have seen yet
               var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
               var gScoreIsBest = false;

               if(!neighbor.visited) {
                   // This the the first time we have arrived at this node, it must be the best
                   // Also, we need to take the h (heuristic) score since we haven't done so yet

                   gScoreIsBest = true;
                   neighbor.h = this._astarHeuristic(neighbor, end);
                   neighbor.visited = true;
                   openList.push(neighbor);
               }
               else if(gScore < neighbor.g) {
                   // We have already seen the node, but last time it had a worse g (distance from start)
                   gScoreIsBest = true;
               }

               if(gScoreIsBest) {
                   // Found an optimal (so far) path to this node.  Store info on how we got here and
                   //  just how good it really is...
                   neighbor.parent = currentNode;
                   neighbor.g = gScore;
                   neighbor.f = neighbor.g + neighbor.h;
                   neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
               }
           }
       }

       // No result was found -- empty array signifies failure to find path
       return [];

  },

  _getAstarGridItemFromId : function(id){
    for(var i = 0; i < this._aStarGrid.length; i++){
      if(this._aStarGrid[i].id === id){
        return this._aStarGrid[i];
      }
    }
  },
  _astarGridSetup : function(obstacles,e){
    var grid = [];
    for(var hex in this.grid.map){
      var nHex = this._astartGridifyFromId(hex);
      if(obstacles){
        for(var i = 0; i < obstacles.length; i++){
          var oId = obstacles[i].q+'.'+obstacles[i].r+'.'+obstacles[i].s;
          if(oId === nHex.id && e.id !== nHex.id){
            nHex.isObstacle = true;
          }
        }
      }
      grid.push(nHex);
    }
    this._aStarGrid = grid;
  },

  _astartGridifyFromId : function(hex){
    var nHex = {};
    nHex.id = hex;
    nHex.neighbors = this.grid.map[hex].neighbors;
    nHex.q = this.grid.map[hex].q;
    nHex.r = this.grid.map[hex].r;
    nHex.s = this.grid.map[hex].s;
    nHex.f = 0;
    nHex.g = 0;
    nHex.h = 0;
    nHex.debug = "";
    nHex.parent = null;
    nHex.isObstacle = false;
    return nHex;
  },

//TODO here we can add a value to the crossing of the current tile
//The equation would be multiplying the crossing cost to the distance
  _astarHeuristic : function(pos,end){
    return this.engine.distanceBetween(pos,end);
  },

/*
//sample
  _astarHeuristic: function(pos0, pos1) {
        // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

        var d1 = Math.abs (pos1.x - pos0.x);
        var d2 = Math.abs (pos1.y - pos0.y);
        return d1 + d2;
  },
*/

  _setCorners : function(){
    this.corners = this.engine.cornersOfHex(this.grid.layout,this);
  },

  _setEdges : function(){
    this.edges = [];
    this.edges.push([this.corners[5], this.corners[0]]);
    for(var i = 4; i >= 0; i--){
      var l = i+1;
      this.edges.push([this.corners[l], this.corners[i]]);
    }
  },

  _setCenter : function(){
      this.centerPoint = this.engine.centerOfHex(this.grid.layout, this);
  },

  _setNeighbors : function(){
    this.neighbors = [];
    for(var i = 0; i < 6; i++){
      var n = this.engine.neighborAtDirection(this,i);
      this.neighbors.push(n.q+'.'+n.r+'.'+n.s);
    }
  },

  _setDiagonalNeighbors : function(){
    this.diagonalNeighbors = [];
    for(var i = 0; i < 6; i++){
      var n = this.engine.neighborsAtDiagonal(this,i);
      this.diagonalNeighbors.push(n.q+'.'+n.r+'.'+n.s);
    }
  },

  _checkIfLineCrosses : function(line){
    var crosses = false;
    for(var i = 0; i < this.edges.length; i++){
      if(this.edges[i]){
        if(this.engine.checkIfLinesIntersect(line,this.edges[i])){
          crosses = true;
          break;
        }
      }
    }
    return crosses;
  },

};


  return {
    setup:setup,
    Engine:Engine,
    Grid:Grid,
    Hex:Hex
  }

})();

//# sourceMappingURL=HexAPI.js.map