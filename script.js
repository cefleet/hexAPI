import {Grid,Engine} from "/HexApi.js";

const {getAllHexesWithinDistance,getHexAtDistanceAndDirection, getAllNeighbors,getAllDiagonalNeighbors,getNeighborAtDirection,getNeighborAtDiagonalDirection} = Engine;
const {pathTo,cornersOfHex,hexAtPoint,map} = Grid();

console.log(getAllNeighbors({q:2,r:2,s:3}))

const canvas = document.querySelector('#canvas');
canvas.height = '800';
canvas.width = '1000';
const ctx = canvas.getContext("2d");
let markedHex = null;
let obstacles = [];
const clear = () =>ctx.clearRect(0, 0, canvas.width, canvas.height);

const drawMap = () => map.map((h)=>drawHex(h));

const drawHex = (h, color='#000',fill=false) =>{

    let corners = cornersOfHex(h);
    ctx.strokeStyle=color;
    ctx.beginPath();
    corners.forEach((c,idx)=>{
        if(idx === 0) return ctx.moveTo(c.x,c.y);
        ctx.lineTo(c.x,c.y);
    })
    ctx.lineTo(corners[0].x,corners[0].y);
    ctx.closePath();
    if(fill){
        ctx.fillStyle=fill;
        ctx.fill();
    }
    ctx.stroke();
}

//for now this is kinda acting like the gameloop
const mouseHex = ({offsetX:x,offsetY:y}, next) => {
    clear();
    drawMap();
    const hex = hexAtPoint({x,y});
    if (next) next(hex);
    //Do all of the other stuff here
    //highlightArea(hex)
    //drawHex(getNeighborAtDiagonalDirection(hex, 3), 'orange')
    getAllDiagonalNeighbors(hex).map(h=>drawHex(h,'orange','orange'))
    if(markedHex) {
        drawLineToHex(hex);
        drawHex(markedHex,'green', 'yellow');
    }
    drawHex(getHexAtDistanceAndDirection(hex,3,0),'blue','green');
    obstacles.forEach(o=>drawHex(o,'orange','black'))

}

const drawLineToHex = (hex)=>{
    let p = pathTo(markedHex,hex,obstacles);
    p.forEach(h=>drawHex(h,'yello','orange'))
}

const highlightArea = (hex) => {
    getAllHexesWithinDistance(hex,4).forEach(h=>drawHex(h,'green','purple'))
}

const markHex = (hex) => {
    if(markedHex) obstacles.push(markedHex);
    markedHex = hex;
}

drawMap(map);


canvas.addEventListener('click', (evt)=>mouseHex(evt, markHex));
canvas.addEventListener('mousemove', (evt)=>mouseHex(evt));