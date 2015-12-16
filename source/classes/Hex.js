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
      return this.distanceBetween(this,hex);
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
