//   HTTP server + WebSocket setup

import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { joining, playersUsernames, setLength } from './playerManager.js';
import { tile } from './game/tile.js';
import { addBricksToBoard, checkSomething } from "./utils.js"
import { WaitingRoom } from './waitingRoom.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POWERUP_TYPES = {
    SPEED: 'speed',
    RANGE: 'range',
    EXTRABOMB: 'ExtraBomb'
};

const POWERUP_CHANCE = 1;
let powerUps = new Map();

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/' || path.extname(url.pathname) != '') {
        const filePath = path.join(__dirname, url.pathname === '/' ? '../public/index.html' : '../public' + url.pathname);
        let contentType = 'text/html';
        const ext = path.extname(filePath);
        switch (ext) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.mp3':
                contentType = 'audio/mpeg';
                break;
        }

        // Check if file exists before trying to read it
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading page');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    } else if (req.method === 'POST' && url.pathname === '/join') {
        joining(req, res)
    }
});


const waitingRoom = new WaitingRoom();
const wss = new WebSocketServer({ server });

let once = true;
let grid;
let started = false;
let isWin = false;
wss.on("connection", (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const username = url.searchParams.get('username')
    if (once) {
        grid = addBricksToBoard(tile.board);
        once = false;
    }

    const player = {
        username,
        xx: {
            socket: ws,
            send: (message) => ws.send(message)
        },
    }
    // console.log("player ===> ", player)
    waitingRoom.addPlayer(player);
    if (waitingRoom.players.size >= 2 && waitingRoom.status === "waiting") {
        waitingRoom.startTimer();
    }
    // if (isWin) {
    //     console.log("OVEEEEEEEEEEEEEEEEEEEEEEEEEEEER wlad L9hab");
    //     ws.send(JSON.stringify({
    //         type: "xxx",
    //         message: "Game Over",
    //         username: username,
    //     }));
    //     isWin = false;
    //     return;
    // }
    ws.on("message", (d) => {
        const data = JSON.parse(d);

        if (data.type == "gamestarted") {
            started = data.started;
        }
        if (data.type === "chat") {
            waitingRoom.broadcast({
                type: "chat",
                from: username,
                message: `${username}: ${data.message}`,
            });
        }

        let movingPlayer = {};
        if (data.type == "move") {
            let position = updatePosition(data.direction, data.position, data.username)
            movingPlayer = data
            ws.send(JSON.stringify({
                type: "self-update",
                id: movingPlayer.username,
                direction: movingPlayer.direction,
                position: position
            }));
            for (const [key, value] of waitingRoom.players.entries()) {
                if (key !== movingPlayer.username) {
                    value.send(JSON.stringify({
                        type: "mouvement",
                        id: movingPlayer.username,
                        direction: movingPlayer.direction,
                        position: position
                    }));
                }
            }
        }



        if (data.type == "bombPlaced") {
            const bombPosition = { ...data.position };
            grid[bombPosition.x][bombPosition.y] = "bomb";

            for (const [key, value] of waitingRoom.players.entries()) {
                value.send(JSON.stringify({
                    type: "bombPlaced",
                    position: data.position,
                }));
            }
            setTimeout(() => {
                grid[bombPosition.x][bombPosition.y] = "path";

                for (const [key, value] of waitingRoom.players.entries()) {
                    value.send(JSON.stringify({
                        type: "bombExploded",
                        position: bombPosition,
                        username: data.username,
                    }));
                }
            }, 5000);
        } else if (data.type === "test") {
            // Check all 4 directions around the bomb with the specified range
            const range = data.range || 1;
            const directions = [];

            // Generate coordinates for each direction based on range
            for (let i = 1; i <= range; i++) {
                directions.push(
                    { x: data.bombCorrds.x - i, y: data.bombCorrds.y }, // Up
                    { x: data.bombCorrds.x + i, y: data.bombCorrds.y }, // Down
                    { x: data.bombCorrds.x, y: data.bombCorrds.y - i }, // Left
                    { x: data.bombCorrds.x, y: data.bombCorrds.y + i }  // Right
                );
            }

            // Check each position in the explosion range
            directions.forEach(pos => {
                // Only affect positions within grid bounds
                if (grid[pos.x] && grid[pos.x][pos.y]) {
                    if (grid[pos.x][pos.y] === "brick") {
                        grid[pos.x][pos.y] = 'path';
                        trySpawnPowerUp(pos);
                    }
                }
            });

            // Reset non-wall/brick tiles to path
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[i].length; j++) {
                    if (grid[i][j] !== "brick" && grid[i][j] !== "wall") {
                        grid[i][j] = "path";
                    }
                }
            }

            // Update player positions
            data.players.forEach(pl => {
                if (data.bombCorrds.x + 1 == pl.position.x && data.bombCorrds.y == pl.position.y ||
                    data.bombCorrds.x - 1 == pl.position.x && data.bombCorrds.y == pl.position.y ||
                    data.bombCorrds.x == pl.position.x && data.bombCorrds.y + 1 == pl.position.y ||
                    data.bombCorrds.x == pl.position.x && data.bombCorrds.y - 1 == pl.position.y ||
                    data.bombCorrds.x == pl.position.x && data.bombCorrds.y == pl.position.y
                ) {
                    pl.lives--;
                    if (pl.lives > 0) {
                        grid[pl.position.x][pl.position.y] = pl.id
                    }
                } else if (pl.lives > 0) {
                    grid[pl.position.x][pl.position.y] = pl.id;
                }

            });


            for (const [key, value] of waitingRoom.players.entries()) {
                value.send(JSON.stringify({
                    type: "newgrid",
                    grid: grid,
                    players: data.players,
                }));
            }
        }
    })

    ws.on("close", () => {

        waitingRoom.removePlayer(player);
        playersUsernames.delete(username);
        setLength.len = playersUsernames.size;
        // started = false;
        // for (const [key, value] of waitingRoom.players.entries()) {
        //     if (key !== username) {
        //         value.send(JSON.stringify({
        //             type: "xxx",
        //             username: username,
        //             message: `Game Over for player ${username}`,
        //         }));
        //     }
        // }
        // movingPlayer = {};
        console.log(`player ==================> `, playersUsernames);
        console.log(`player ==========> `, waitingRoom.players.size);
        console.log(`Started ==========> `, started);
        if (waitingRoom.players.size === 1) {

            console.log("game ended!!!!!!!!!!!!");
            // isWin = true
            // if (isWin) {
            for (const [key, value] of waitingRoom.players.entries()) {
                console.log("OVEEEEEEEEEEEEEEEEEEEEEEEEEEEER wlad L9hab");
                value.send(JSON.stringify({
                    type: "xxx",
                    message: "Game Over",
                    username: key,
                }));
                // started = false;
                //return;
            }

            // started = false;
            // waitingRoom.players.clear();
            // playersUsernames.clear();
            // setLength.len = 0;
            // console.log(`player array in CLOSE  `, playersUsernames);
            // console.log(`player in CLOSE `, waitingRoom.players.size);
        }
    })
    console.log(`Started after close ==========> `, started);

    console.log(`player array after `, playersUsernames);
    console.log(`player map after `, waitingRoom.players.size);
})

function updatePosition(direction, position, username) {
    if (Obstacles(position, direction, username)) {
        if (direction === 'up') {
            position.x -= 1
        } else if (direction === 'down') {
            position.x += 1
        } else if (direction === 'left') {
            position.y -= 1
        } else if (direction === 'right') {
            position.y += 1
        }
    }

    // Check if player moved to a power-up position
    const powerUpKey = `${position.x},${position.y}`;
    if (powerUps.has(powerUpKey)) {
        const powerUpType = powerUps.get(powerUpKey);
        powerUps.delete(powerUpKey);
        for (const [key, value] of waitingRoom.players.entries()) {
            value.send(JSON.stringify({
                type: "powerUpCollected",
                position: position,
                powerUpType: powerUpType,
                playerId: username
            }));
        }
    }
    return position
}

function trySpawnPowerUp(position) {
    // Remove random chance - always spawn a power-up
    const types = [POWERUP_TYPES.SPEED, POWERUP_TYPES.RANGE, POWERUP_TYPES.EXTRABOMB];
    const type = types[Math.floor(Math.random() * types.length)]; powerUps.set(`${position.x},${position.y}`, type);
    for (const [key, value] of waitingRoom.players.entries()) {
        value.send(JSON.stringify({
            type: "powerUpSpawned",
            position: position,
            powerUpType: type
        }));
    }
}

function Obstacles(position, direction, username) {
    if (started) {
        checkSomething(grid);
        started = false;
    }
    const nextX = position.y + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0);
    const nextY = position.x + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0);

    if (grid[nextY] && grid[nextY][nextX] != "path" && grid[nextY][nextX] != username) {
        return false;
    }
    return true;
}

export function throttle(func, delay) {
    let isWaiting = false;
    return function executedFunction(...args) {
        if (!isWaiting) {
            func.apply(this, args);
            isWaiting = true;
            setTimeout(() => {
                isWaiting = false;
            }, delay);
        }
    };
}

server.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});