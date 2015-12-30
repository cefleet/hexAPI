HexAPI.Hex = function(options) {
  this._init(options);
};

HexAPI.Hex.prototype = {
  _init: function(options){
    this.engine = HexAPI.engine;
    this.grid = options.grid || HexAPI.grid;

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
