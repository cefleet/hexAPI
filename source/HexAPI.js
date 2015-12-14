var HexAPI = {
  EVEN :  1,
  ODD : -1,
  DIRECTIONS : [HexAPI.Hex(1, 0, -1), HexAPI.Hex(1, -1, 0), HexAPI.Hex(0, -1, 1), HexAPI.Hex(-1, 0, 1), HexAPI.Hex(-1, 1, 0), HexAPI.Hex(0, 1, -1)],
  _hexAdd : function(a,b){
    return HexAPI.Hex(a.q + b.q, a.r + b.r, a.s + b.s);
  },
  _hexSubtract : function(a,b){
    return HexAPI.Hex(a.q - b.q, a.r - b.r, a.s - b.s);
  },
  _hexScale : function(a,k){
    return Hex(a.q * k, a.r * k, a.s * k);
  }
};


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

HexAPI.Point = function(x,y){
  return {x:x, y:y};
};

//# sourceMappingURL=HexAPI.js.map