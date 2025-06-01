// Helpers: random ID, timers, etc.


const Positions = {
    topLeft: { x: 1, y: 1 },
    topRight: { x: 21, y: 1 },
    bottomLeft: { x: 1, y: 13 },
    bottomRight: { x: 21, y: 13 },
};

export function createPlayer(tile, usernames) {
    let i = 1;
    usernames.forEach((username) => {        
        if (i == 1) {
            tile[Positions.topLeft.y][Positions.topLeft.x] = username;
            i++
        }
        else if (i == 2) {
            tile[Positions.topRight.y][Positions.topRight.x] = username;
            i++
        } else if (i == 3) {
            tile[Positions.bottomLeft.y][Positions.bottomLeft.x] = username;
            i++
        } else if (i == 4) {
            tile[Positions.bottomRight.y][Positions.bottomRight.x] = username;
        }
    });
    return tile;
}



export function checkSomething(tile) {
    tile[Positions.topLeft.y][Positions.topLeft.x] = "path";
    tile[Positions.topRight.y][Positions.topRight.x] = "path";
    tile[Positions.bottomLeft.y][Positions.bottomLeft.x] = "path";
    tile[Positions.bottomRight.y][Positions.bottomRight.x] = "path";
}

export function isEmpty(row, cell, tile) {
    //top left
    if (((row == 1) && (cell == 1 || cell == 2)) || ((cell == 1) && (row == 2 || row == 3))) return false;

    //top right
    if (((row == 1) && (cell == 21 || cell == 20)) || ((cell == 21) && (row == 2 || row == 3))) return false;

    // bottom left
    if (((row == 13) && (cell == 1 || cell == 2)) || ((cell == 1) && (row == 12 || row == 11))) return false;

    // bottom right
    if (((row == 13) && (cell == 21 || cell == 20)) || ((cell == 21) && (row == 12 || row == 11))) return false;

    if (tile[row][cell] == "path") return true;

    return false;
}

const BRICKS_NUMBER = 50;
export function addBricksToBoard(map) {
    let i = 0;
    let tileMap = map

    while (i < BRICKS_NUMBER) {
        let row = Math.floor(Math.random() * tileMap.length);
        let cell = Math.floor(Math.random() * tileMap[0].length);
        
        if (isEmpty(row, cell, tileMap)) {
            tileMap[row][cell] = "brick";
            i++;
        }
    }
    return tileMap;
}