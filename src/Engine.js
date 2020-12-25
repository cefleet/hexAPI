const directions = ()=>[makeHex(1, 0, -1),makeHex(1, -1, 0),makeHex(0, -1, 1),makeHex(-1, 0, 1),makeHex(-1, 1, 0),makeHex(0, 1, -1)];
const diagonals = ()=>[makeHex(2, -1, -1),makeHex(1, -2, 1),makeHex(-1, -1, 2),makeHex(-2, 1, 1),makeHex(-1, 2, -1),makeHex(1, 1, -2)];
const hexLerp = (a, b, t)=>makeHex(a.q+(b.q-a.q)*t, a.r+(b.r-a.r)*t, a.s+(b.s-a.s)*t);
export const array = (s)=> new Array(s).fill(0);//crappy i know

export const makeHex = (q,r,s)=>({q,r,s});
export const hexAdd = (a,b)=>makeHex(a.q + b.q, a.r + b.r, a.s + b.s);
export const hexScale = (a,k)=>makeHex(a.q * k, a.r * k, a.s * k);

export const direction = (d)=>directions()[d];

export const diagonal = (d)=>diagonals()[d];

export const roundToHex = (hex)=>{
    const q = Math.trunc(Math.round(hex.q));
    const r = Math.trunc(Math.round(hex.r));
    const s = Math.trunc(Math.round(hex.s));
    const q_diff = Math.abs(q - hex.q);
    const r_diff = Math.abs(r - hex.r);
    const s_diff = Math.abs(s - hex.s);

    if (q_diff > r_diff && q_diff > s_diff) return makeHex(-r-s,r,s);    
    if(r_diff > s_diff) return makeHex(q,-q - s,s);    
    return makeHex(q,r,-q-r)
      
};


export const defineLineBetweenHexes = (a, b)=>{
    const N = distanceBetween(a, b);
    const step = 1.0 / Math.max(N, 1);
    return array(N).map((_,idx)=>roundToHex(hexLerp(a,b, step*idx)));
};


export const distanceBetween = (hexA,hexB) => {
    return (
        Math.abs(hexA.q - hexB.q) +
        Math.abs(hexA.q+hexA.r-hexB.q-hexB.r) +
        Math.abs(hexA.r-hexB.r)
    )/2;
};

export const neighborAtDirection = (hex, dir) => hexAdd(hex,direction(dir));

export const neighborsAtDiagonal = (hex, dir)=>hexAdd(hex, diagonal(dir));

export const allNeighbors = (hex) => array(6).map((_,idx)=>neighborAtDirection(hex,idx))

export const allDiagonalNeighbors = (hex) =>array(6).map((_,idx)=>neighborsAtDiagonal(hex,idx));

export const getAllHexesWithinDistance = (hex,dist) =>[hex, ...array(dist+1).flatMap((_, idx)=>getAllHexesAtDistance(hex,idx))]

export const getHexAtDistance = (hex,dis,dir) => hexAdd(hex,hexScale(direction(dir), dis));

export const getAllHexesAtDistance = (hex,dis)=> {
    let corners = array(6).map((_,idx)=>getHexAtDistance(hex,dis,idx))
    return corners.flatMap((h,idx)=>{
        return defineLineBetweenHexes(h, corners[idx == 0 ? 5:idx-1])
    })
}

export const makePointyMap = (rows, cols) => {
    let map = [];
    for(let r = 0; r < rows; r++){
        let r_offset = Math.floor(r/2);
        for(let q = -r_offset; q < cols-r_offset; q++){
            map.push(makeHex(q,r,-q-r));
        }
    }
    return map;
};

export const makeFlatMap =(rows, cols) => {
    let map = [];
    for(let q = 0; q < cols; q++){
        let q_offset = Math.floor(q/2);
        for(let r = -q_offset; r < rows-q_offset; r++){
            map.push(makeHex(q,r,-q-r));
        }
    }
    return map;
};  