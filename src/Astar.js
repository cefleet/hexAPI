import {distanceBetween, allNeighbors, defineLineBetweenHexes} from "./Engine.js";

const astarHeuristic = (pos,end)=>distanceBetween(pos,end);

const hexId = (h) => `${h.q}.${h.r}.${h.s}`;

const makeGridHex = (h,obstacles=[])=>({
  ...h,
  f:0,
  g:0,
  h:0,
  parent:null,
  isObstacle:obstacles.find(o=>hexId(h) == hexId(o)?true:false) ? true: false
})

const astarGridSetup = (hexes,obstacles)=>hexes.map(h=>makeGridHex(h,obstacles));

export const pathTo = (start,end,hexes=[],obstacles=[])=>{

  const straight = defineLineBetweenHexes(start,end);
  if(!straight.find(h=>obstacles.find(o=>hexId(o) == hexId(h)))) return straight;

  const grid = astarGridSetup(hexes,obstacles);

  const openList = [makeGridHex(start)];

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
      // openList.remove(lowInd);
      openList.splice(lowInd,1);
      currentNode.closed = true;
      //console.log(currentNode)
      //goona
      
      let neighbors = allNeighbors(currentNode); //.forEach(n => {
      for(let i = 0; i < neighbors.length; i++){
        let n = neighbors[i];
        let neighbor = grid.find(h=>hexId(h) == hexId(n));
       // console.log(neighbor,n)
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

