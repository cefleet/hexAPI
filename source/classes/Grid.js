HexAPI.Grid = function(options) {
  this._init(options);
};

HexAPI.Grid.prototype = {
  _init: function(options){
    this.engine = HexAPI.engine;

    options = options || {};
    this.hexSize = options.hexSize || {x:30,y:30};
    this.origion = options.origion || {x:0,y:0};
    this.orientation = options.orientation || 'flat';

    this.layout = this.engine.createLayout(this.hexSize, this.origion, this.orientation);

    this.rows = options.rows || 30;
    this.cols = options.cols || 20;

    this._createMap();
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
