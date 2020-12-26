import Engine from "./Engine.js";    

const {_makeHex,_roundToHex, getAllNeighbors, getHexLineBetweenHexes, getDistanceBetweenHexes} = Engine;
const pointy = ()=>orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
const flat = ()=>orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);
const orientation = (f0, f1, f2, f3, b0, b1, b2, b3, start_angle) =>({f0, f1, f2, f3, b0, b1, b2, b3, start_angle});
export const point = (x,y)=>({x, y});

const astarHeuristic = (pos,end)=>getDistanceBetweenHexes(pos,end);

const hexId = (h) => `${h.q}.${h.r}.${h.s}`;

const makeAstarHex = (h,obstacles=[])=>({
    ...h,
    f:0,
    g:0,
    h:0,
    parent:null,
    isObstacle:obstacles.find(o=>hexId(h) == hexId(o)?true:false) ? true: false
})
  
const astarGridSetup = (hexes,obstacles)=>{
    let results = [];
    for(let i = 0; i < hexes.length; i++) results.push(makeAstarHex(hexes[i],obstacles));
    return results;
    //needed a speed boost so I did for loop instead
    //hexes.map(h=>makeAstarHex(h,obstacles)); 

}

const makePointyMap = (rows, cols) => {
    let map = [];
    for(let r = 0; r < rows; r++){
        let r_offset = Math.floor(r/2);
        for(let q = -r_offset; q < cols-r_offset; q++){
            map.push(_makeHex(q,r,-q-r));
        }
    }
    return map;
};

const makeFlatMap =(rows, cols) => {
    let map = [];
    for(let q = 0; q < cols; q++){
        let q_offset = Math.floor(q/2);
        for(let r = -q_offset; r < rows-q_offset; r++){
            map.push(_makeHex(q,r,-q-r));
        }
    }
    return map;
};

//The Grid deals with hexes in a point based space. It can be used to manage a grid and draw the actual hexes.
const Grid = ({hexSize={x:30,y:30}, origin={x:0,y:0}, type='pointy', rows=10, cols=10}={}) => {

    const O = type == 'pointy' ? pointy() : flat();

    const map = type == 'pointy' ? makePointyMap(rows,cols) : makeFlatMap(rows,cols);

    const centerOfHex = (hex,onlyInMap=false)=>{
        if(onlyInMap) if(!map.find(h=>hexId(h) == hexId(hex))) return;
        const x = (O.f0 * hex.q + O.f1 * hex.r) * hexSize.x;
        const y = (O.f2 * hex.q + O.f3 * hex.r) * hexSize.y;
        return point(x + origin.x, y + origin.y);
    };
    
    const cornersOfHex = (hex, onlyInMap=false)=>{
        if(onlyInMap) if(!map.find(h=>hexId(h) == hexId(hex))) return;

        const cornerOffset = (corner) => {
            const angle = 2.0 * Math.PI * (corner + O.start_angle) / 6;
            return point(hexSize.x * Math.cos(angle), hexSize.y * Math.sin(angle));
        }; 
        const corners = [0,1,2,3,4,5,6];
        const center = centerOfHex(hex);
        return corners.map(i=>{
            const offset = cornerOffset(i);
            return point(center.x+offset.x, center.y+offset.y)
        });
    };
    
    const hexAtPoint = (p, onlyInMap=false)=>{
        const pt = point((p.x - origin.x) / hexSize.x, (p.y - origin.y) / hexSize.y);
        const q = O.b0 * pt.x + O.b1 * pt.y;
        const r = O.b2 * pt.x + O.b3 * pt.y;
        const s = -q-r;
        //results in a fractional hex thus rounding
        let hex = _roundToHex({q, r, s});
        if(!onlyInMap) return hex;
        return map.find(h=>hexId(h) == hexId(hex))
    };

    //This uses astar
    const pathTo = (start,end,obstacles=[])=>{

        //first draw a straigh line. This assumes that the grid is filled.
        const straight = getHexLineBetweenHexes(start,end);
      
        //If every item in the line is in the hexes group but not in the hexes group
        if(!straight.find(h=>map.find(g=>hexId(g) == hexId(h)) ? obstacles.find(o=>hexId(o) == hexId(h)):tue)) return straight;

        //cosider how to speed this up.
        const grid = astarGridSetup(map,obstacles);
      
        const openList = [makeAstarHex(start)];
      
        let lowInd, lowF, currentNode;
      
        while(openList.length > 0) {
            // Grab the lowest f(x) to process next
            lowInd = 0;
            lowF = openList[lowInd].f || 0;
            for(let i = 0; i < openList.length; i++){
              let hex = openList[i];  
              if(hex.f < lowF) {
                lowInd = i;
                lowF = hex.f;
              }
            }
      
            currentNode = openList[lowInd];
            // End case -- result has been found, return the traced path
            //There is no parent
            if(hexId(currentNode) == hexId(end)) {
                let curr = currentNode;
                let ret = [];
                while(curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();
            }
      
            // Normal case -- move currentNode from open to closed, process each of its neighbors
            openList.splice(lowInd,1);
            currentNode.closed = true;
            
            let neighbors = getAllNeighbors(currentNode); 
            for(let i = 0; i < neighbors.length; i++){
              let n = neighbors[i];
              let neighbor = grid.find(h=>hexId(h) == hexId(n));
              if(!neighbor || neighbor.closed || neighbor.isObstacle) continue;
              let gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
              let gScoreIsBest = false;
              if(!neighbor.visited) {
                // This the the first time we have arrived at this node, it must be the best
                // Also, we need to take the h (heuristic) score since we haven't done so yet
      
                gScoreIsBest = true;
                neighbor.h = astarHeuristic(neighbor, end);
                neighbor.visited = true;
                openList.push(neighbor);
              } else if(gScore < neighbor.g) {
                // We have already seen the node, but last time it had a worse g (distance from start)
                gScoreIsBest = true;
              }
      
              if(gScoreIsBest) {
                  // Found an optimal (so far) path to this node.  Store info on how we got here and
                  //  just how good it really is...
                  neighbor.parent = currentNode;
                  neighbor.g = gScore;
                  neighbor.f = neighbor.g + neighbor.h;
              }
            };
        }
           // No result was found -- empty array signifies failure to find path
           return [];
      };

    return {map, hexAtPoint,cornersOfHex,centerOfHex, pathTo}
}

export default Grid;