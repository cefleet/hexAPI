var HexAPI = {
  setup : function(options){
    options = options || {};
    this.engine = new HexAPI.Engine();
    //TODO somehow if there is no default layout
    this.grid = new HexAPI.Grid(options.grid); 
  }
};
