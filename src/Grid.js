import {makeFlatMap,makePointyMap,roundToHex} from "./Engine.js";    

const pointy = ()=>orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
const flat = ()=>orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);
const orientation = (f0, f1, f2, f3, b0, b1, b2, b3, start_angle) =>({f0, f1, f2, f3, b0, b1, b2, b3, start_angle});
export const point = (x,y)=>({x, y});

//The Grid deals with hexes in a point based space.
const Grid = ({hexSize={x:30,y:30}, origin={x:0,y:0}, type='pointy', rows=30, cols=20}={}) => {
    const O = type == 'pointy' ? pointy() : flat();

    const map = () => type == 'pointy' ? makePointyMap(rows,cols) : makeFlatMap(rows,cols);

    const centerOfHex = (hex)=>{
        const x = (O.f0 * hex.q + O.f1 * hex.r) * hexSize.x;
        const y = (O.f2 * hex.q + O.f3 * hex.r) * hexSize.y;
        return point(x + origin.x, y + origin.y);
    };
    
    const cornersOfHex = (hex)=>{
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
    
    const hexAtPoint = (p)=>{
        const pt = point((p.x - origin.x) / hexSize.x, (p.y - origin.y) / hexSize.y);
        const q = O.b0 * pt.x + O.b1 * pt.y;
        const r = O.b2 * pt.x + O.b3 * pt.y;
        const s = -q-r;
        //results in a fractional hex thus rounding
        return roundToHex({q, r, s});
    };

    return {map, hexAtPoint,cornersOfHex,centerOfHex}
}

export default Grid;

//This doesn't really go here
export const checkIfLinesIntersect = (l1,l2)=>{

    const line1StartX = l1[0].x;
    const line1StartY = l1[0].y;
    const line1EndX = l1[1].x;
    const line1EndY = l1[1].y;

    const line2StartX = l2[0].x;
    const line2StartY = l2[0].y;
    const line2EndX = l2[1].x;
    const line2EndY = l2[1].y;

    const denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) -
    ((line2EndX - line2StartX) * (line1EndY - line1StartY));

    if (denominator === 0) {
        return result;
    }

    const a = line1StartY - line2StartY;
    const b = line1StartX - line2StartX;
    const numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    const numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    const aa = numerator1 / denominator;
    const bb = numerator2 / denominator;

    // if line1 is a segment and line2 is infinite, they intersect if:
    if (aa > 0 && aa < 1 && bb > 0 && bb < 1) {
        return true;
    }
    return result;
};
  