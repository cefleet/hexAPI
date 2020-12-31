//import and get the needed functions
import {Grid,Engine} from "./src/HexApi.js";
const {getAllHexesWithinDistance} = Engine;
const {pathToPromise,cornersOfHex,hexAtPoint,map} = Grid({hexSize:{x:19,y:19},origin:{x:20,y:20},rows:20,cols:20});


//Get the canvas item for drawing
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext("2d");

//setup some module wide variables
let markedHex = null;
let curHex = null;
let obstacles = [];

//common way to re-draw a canvas
const clear = () =>ctx.clearRect(0, 0, canvas.width, canvas.height);

//draws every hex in the map
const drawMap = () => map.map((h)=>drawHex(h));

//Uses the corners to make lines between the corners and stroke a path for the corners.
const drawHex = (h, color='#000',fill=false) => {

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


const highlightArea = (hex,dist) => {
    getAllHexesWithinDistance(hex,dist).forEach(h=>drawHex(h,'green','purple'))
}

const markHex = (hex) => {
    if(markedHex) obstacles.push(markedHex);
    markedHex = hex;
}

const mouseMove = async ({x,y}) => {

    const hex = hexAtPoint({x,y});
    //no need to re-render inside the same hex.
    if(curHex && `${hex.q}.${hex.r}.${hex.s}` == `${curHex.q}.${curHex.r}.${curHex.s}`) return;
    curHex = hex;

    clear();
    drawMap();
    
    //gets the hex at the point
    

    highlightArea(hex,2);
    if(markedHex) {
        //If there is a marked hex, a path will be found. 
        //Then each hex in the path will be drawn from the marked hex to the hex under. 
        let res = await pathToPromise(markedHex,hex,obstacles)
        res.forEach(h=>drawHex(h,'yello','orange'));
        //draws the marked hex
        drawHex(markedHex,'green', 'yellow');
    }
    //draws the hex under the map
    drawHex(hex,'blue','green');
    //draw all of the obstacles
    obstacles.forEach(o=>drawHex(o,'orange','black'));
}

//listens for the mousemove and click and gets the x,y from th offset.
canvas.addEventListener('click', ({offsetX:x,offsetY:y})=>markHex(hexAtPoint({x,y})));
canvas.addEventListener('mousemove', ({offsetX:x,offsetY:y})=>mouseMove({x,y}));

//Initialy draws the map
drawMap();
