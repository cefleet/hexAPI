HexAPI.Hex = function(options) {
  this._init(options);
};

HexAPI.Hex.prototype = {
  _init: function(options){
    this.engine = HexAPI.engine;
    this.grid = options.grid || HexAPI.defaultGrid;

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
    return [this.centerPoint,hex.centerPoint];
  },

  _setCorners : function(){
    this.corners = this.engine.cornersOfHex(this.grid.layout,this);
  },

  _setEdges : function(){
    this.edges = [];

    for(var i = 1; i < 6; i++){
      this.edges.push({p1:this.corners[i-1], p2:this.corners[i]});
    }
    this.edges.push({p1:this.corners[5], p2:this.corners[0]});
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

  //TODO LOS
  /*
    For now LOS is going to get all of the edges of the the "_defineLineBetweenHexes" and all of the neighbors and get and see if my line intersects with any of their edges
  */
  //TODO Movement with obstacle
};
