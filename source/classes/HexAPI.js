var HexAPI = {
  setup : function(options){
    options = options || {};
    console.log(options);
    this.engine = new HexAPI.Engine();
    //TODO somehow if there is no default layout
    this.grid = new HexAPI.Grid(options.grid);
  }
};
