var HexAPI = {
  setup : function(){
    this.engine = new HexAPI.Engine();
    //TODO somehow if there is no default layout
    this.defaultGrid = new HexAPI.Grid();
  }
};
