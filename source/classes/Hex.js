HexAPI.Hex = function(q, r, s) {
    //return {q: q, r: r, s: s};
    this.q = q;
    this.r = r;
    this.s = s;
};

HexAPI.Hex.prototype = {
  _direction : function(d){
    return HexAPI.DIRECTIONS(d);
  },

  neighborAtDirection : function(direction){
    return HexAPI._hexAdd(this,this._direction(direction));
  }
};
