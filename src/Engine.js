export default (() =>{
    //exported but only used in Grid
    const _makeHex = (q,r,s)=>({q,r,s});
    const _roundToHex = (hex)=>{
        const q = Math.trunc(Math.round(hex.q));
        const r = Math.trunc(Math.round(hex.r));
        const s = Math.trunc(Math.round(hex.s));
        const q_diff = Math.abs(q - hex.q);
        const r_diff = Math.abs(r - hex.r);
        const s_diff = Math.abs(s - hex.s);

        if (q_diff > r_diff && q_diff > s_diff) return _makeHex(-r-s,r,s);    
        if(r_diff > s_diff) return _makeHex(q,-q - s,s);    
        return _makeHex(q,r,-q-r)
        
    };

    //Private functions
    const directions = ()=>[_makeHex(1, 0, -1),_makeHex(1, -1, 0),_makeHex(0, -1, 1),_makeHex(-1, 0, 1),_makeHex(-1, 1, 0),_makeHex(0, 1, -1)];
    const diagonals = ()=>[_makeHex(2, -1, -1),_makeHex(1, -2, 1),_makeHex(-1, -1, 2),_makeHex(-2, 1, 1),_makeHex(-1, 2, -1),_makeHex(1, 1, -2)];
    const hexLerp = (a, b, t)=>_makeHex(a.q+(b.q-a.q)*t, a.r+(b.r-a.r)*t, a.s+(b.s-a.s)*t);

    const array = (s)=> new Array(s).fill(0);//crappy i know

    const hexAdd = (a,b)=>_makeHex(a.q + b.q, a.r + b.r, a.s + b.s);
    const hexScale = (a,k)=>_makeHex(a.q * k, a.r * k, a.s * k);

    const direction = (d)=>directions()[d];

    const diagonal = (d)=>diagonals()[d];

    

    //Public Functions
    const  getHexLineBetweenHexes = (a, b)=>{
        const N = getDistanceBetweenHexes(a, b);
        const step = 1.0 / Math.max(N, 1);
        return array(N).map((_,idx)=>_roundToHex(hexLerp(a,b, step*idx)));
    };


    const getDistanceBetweenHexes = (hexA,hexB) => {
        return (
            Math.abs(hexA.q - hexB.q) +
            Math.abs(hexA.q+hexA.r-hexB.q-hexB.r) +
            Math.abs(hexA.r-hexB.r)
        )/2;
    };

    const getNeighborAtDirection = (hex, dir) => hexAdd(hex,direction(dir));

    const getNeighborAtDiagonalDirection = (hex, dir)=>hexAdd(hex, diagonal(dir));

    const getAllNeighbors = (hex) => array(6).map((_,idx)=>getNeighborAtDirection(hex,idx))

    const getAllDiagonalNeighbors = (hex) =>array(6).map((_,idx)=>getNeighborAtDiagonalDirection(hex,idx));

    const getAllHexesWithinDistance = (hex,dist) =>[hex, ...array(dist+1).flatMap((_, idx)=>getAllHexesAtDistance(hex,idx))]

    const getHexAtDistanceAndDirection = (hex,dis,dir) =>hexAdd(hex,hexScale(direction(dir), dis));

    const getAllHexesAtDistance = (hex,dis)=> {
        let corners = array(6).map((_,idx)=>getHexAtDistanceAndDirection(hex,dis,idx))
        return corners.flatMap((h,idx)=>{
            return getHexLineBetweenHexes(h, corners[idx == 0 ? 5:idx-1])
        })
    }

    //TODO 
    //getHexLineAtDistanceAndDirection = (hex, dir,dist)
    //getHexDiagonalLineAtDistanceAndDirection = (hex, dir,dist)



    return {
        _makeHex,
        _roundToHex,
        getHexLineBetweenHexes,
        getDistanceBetweenHexes,
        getNeighborAtDirection,
        getNeighborAtDiagonalDirection,
        getAllNeighbors,
        getAllDiagonalNeighbors,
        getHexAtDistanceAndDirection,
        getAllHexesAtDistance,
        getAllHexesWithinDistance
    }
})();