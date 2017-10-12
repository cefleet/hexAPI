var HexAPI = (function(){
//It is closed at the HexAPIEnd.js
//Is there a better way to do this?
  var setup = function(options){
    options = options || {};
    options.engine = Engine
    return new Grid(options);
  };
