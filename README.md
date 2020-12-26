# HexAPI
** Updated Dec 2020 **
- Now Uses ES6 Modules

## Description
HexAPI is a simple javascript API for for hexagonal games or applications. 
It is an adaptation from the the articles written by Amit Patel on the subject. 
Read more here : http://www.redblobgames.com/grids/hexagons/

## Installation
- CDN comming ... eventually (possibly)
- NPM module for Node.js comming ... eventually (possibly)
### Currernt steps
1. Clone repository into your project.
2. Import needed components
```js
    import {Grid,Engine} from "./libs/HexApi.js";
```

## API
 All Hexes are an object (or Map) with q,r,s keys.
```js
    let aHex = {q:2,r:2,s:3}
```
All Points are an object (or Map) with x,y keys.
```js
    let aPoint = {x:10,y:20}
```
### Grid
- The Grid will supply x,y coordinates for hexes and can find a hex based on an x,y coordinates. 
- The grid will also supply a 'map' of the hexes that fit within the grid parameters.
- Importing the Grid returns a function that will need to be called in order to use the grid.

#### The Grid Function
- Grid MUST be called on order to create the grid and use any of the grid functions.
- The options argument is an object that provides settings for the grid.
```js
const myGrid = Grid(options);
console.log(myGrid.map);
```
```js
//or if you prefer the destructing method
const {map,hexAtPoint,pathTo} = Grid(options);
```
#### Grid Options Argument
- **hexSize** - *Object or Map* with an x and y keys that are both numbers. These numbers are the units (often pixels) to determine  the size of the hex.
    - *defult value* - {x:30,y:30}
- **origin** - *Object or Map* with an x and y keys that are both numbers. This is how far from 0,0 that the map is to start. Used mostly for when a canvas is only rendering a section of the map.
    - *default value* - {x:0,y:0}
- **type** - *String of either 'pointy' or 'flat'* . This determines the orietation of the hexes. Pointy has the top part as a corner and flat has the top part be a horizontal line.
    - *default value* - 'pointy'
- **rows** - *Integer* of how many rows of hexes the grid will make.
    - *default value* - 10
- **cols** - *Integer* of how many columns of hexes the grid will make.
    - *default value* - 10
```js
    //example
    const myGrid = Grid({
        hexSize:{x:10,y:10},
        type:'flat'
    });
    //origin, rows, cols will all use the defaults.
```
- The prefered way is to use the descructruing syntax to use only the needed functions.

```js
    const {map,cornersOfHex,pathTo} = Grid({hexSize:{x:10,y:10},type:'flat'});
```
#### map parameter
- *Array* of all of the hexes that the grid created based on the rows and cols suppied when the Grid function was called.

#### hexAtPoint
**Returns** - *Hex or undefined* of the hex the point supplied is within. If the optional second  argument 'onlyInMap' is set to true, and the point is outside of the grid, then it would return undefined.
- point is an object or Map that has keys x and y.
```js
    let foundHex = hexAtPoint({x:100,y:100})
```
#### centerOfHex
**Returns** - *Point or undefined* of the center point of a hex. If the optional second  argument 'onlyInMap' is set to true, and the hex is outside of the grid, then it would return undefined.
```js
    let hexCenterPoint = centerOfHex(hex);
```
#### cornersOfHex
**Returns** - *Array of Points or undefined* - of the 6 corners of the supplied hex. If the optional second  argument 'onlyInMap' is set to true, and the hex is outside of the grid, then it would return undefined.
```js
    let corners = cornersOfHex(hex);
```

#### pathTo
**Returns** - *Array of Hexes* - from the start hex to the end hex.
- This function used an astar path finding algorythim if there are obstacles found in the straightest path or if the straightest path would include hexes outside of the grid.
- Obstacles is an optional argument that is an array of hexes.
- This functions relies on the grid map and will never return items outside of the grid.
```js
    let thePath = pathTo(hexA,hexB,obstacles);
```
### Engine
- The Engine component handles all of the math directly related to the hexes. It operates independantly of size or orientation of the grid.
- Importing the Engine returns an object of the needed functions.
- Normally these values are provided from the grid, but the math is valid without a grid.
- If a grid is being used, the values supplied by the engine can be out of the limit of the grid map. Validation will need to be done to make sure the values are found in the grid.

```js
//example
const {getAllNeighbors} = Engine;

console.log(getAllNeighbors({q:2,r:2,s:3}))
/*
    //output
    [   {q: 3, r: 2, s: 2},
        {q: 3, r: 1, s: 3},
        {q: 2, r: 1, s: 4},
        {q: 1, r: 2, s: 4},
        {q: 1, r: 3, s: 3},
        {q: 2, r: 3, s: 2}
    ]
*/
```

### Engine Functions

#### getHexLineBetweenHexes
 
 **Returns** - *Array* of connected hexes between two different hexes.
 ```js
    let arrayOfHexes = getHexLineBetweenHexes(hexA,hexB)
 ```

#### getDistanceBetweenHexes
**Returns** - *Number* representing how many hexes are between the two different hexes.
```js
    let numberOfHexes = getDistanceBetweenHexes(hexA,hexB);
```
#### getNeighborAtDirection
**Returns** - *Hex* of the connected hex at the specified direction.

- direction is a Number between 0-5. Starting with 0 going counter-clockwise. 0 is the hex directly right of the hex if it is pointy grid and lower right if it is a flat grid. 
```js
    //flat
    let upHex = getNeighborAtDirection(hex, 2);

    //pointy
    let leftHex = getNeighborAtDirection(hex,3);
```
#### getNeighborAtDiagonalDirection
**Returns** - *Hex* of the hex going out from the specified corner.
- direction is a Number between 0-5. Starting with 0 going counter-clockwise. 0 is the corner directly right of the hex if it is flat grid and upper right if it is a pointy grid. 

```js
    //flat
    let rightHex = getNeighborAtDiagonalDirection(hex, 0);

    //pointy
    let lowerLeftHex = getNeighborAtDiagonalDirection(hex,3);
```
#### getAllNeighbors
**Returns** - *Array* of all of the connected hexes. It will always return an array with 6 items even if the items are outside of a grid map.
```js
    let neighbors = getAllNeighbors(hex);
```
#### getAllDiagonalNeighbors
**Returns** - *Array* of all of the hexes going out from the corners of the supplied hex. It will ways return an array with 6 items even if the items are outside of a grid map.
```js
    let cornerNeighbors = getAllDiagonalNeighbors(hex);
```
#### getHexAtDistanceAndDirection
**Returns** - *Hex* at the specified distant and direction.
- direction is a Number between 0-5. Starting with 0 going counter-clockwise. 0 is the hex directly right of the hex if it is pointy grid and lower right if it is a flat grid.
- distance is how many hexes away the target he is.
```js
//pointy map
    let right4away = getHexAtDistanceAndDirection(hex,4,0)
```
#### getAllHexesAtDistance
**Returns** - *Array* of hexes at the specified distance. Essentally it returns a ring of hexes around the given hex.

```js
    let ringAtTwo = getAllHexesAtDistance(hex,2);
```
#### getAllHexesWithinDistance
**Returns** - *Array* of all of the hexes within the distance supplied.
```js
    let allHexesAround = getAllHexesWithinDistance(hex,3);
```