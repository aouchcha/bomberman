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
// import { players } from '../public/game/gameRoom.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POWERUP_TYPES = {
    SPEED: 'speed',
    RANGE: 'range',
    EXTRABOMB: 'ExtraBomb'
};


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


export const waitingRoom = new WaitingRoom();
const wss = new WebSocketServer({ server });

let once = true;
let grid;
let started = false;

wss.on("connection", (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const username = url.searchParams.get('username')

    if (once) {
        grid = addBricksToBoard(tile.board);
        once = false;
    }

    waitingRoom.addPlayer({ username: username, soket: ws });
    if (waitingRoom.players.size >= 2 && waitingRoom.status === "waiting") {
        waitingRoom.startTimer();
    }
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

        for (const [key, value] of waitingRoom.players.entries()) {
            value.send(JSON.stringify({
                status: "counter",
                type: "counter",
                counter: waitingRoom.players.size,
                username: key,
            }));
        }

        let movingPlayer = {};
        if (data.type == "move") {
            let { position, players, myplayer } = updatePosition(data.direction, data.position, data.myplayer, data.players)
            movingPlayer = data

            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[i].length; j++) {
                    if (grid[i][j] !== "brick" && grid[i][j] !== "wall" && !grid[i][j].includes("bomb") && !powerUps.has(`${i},${j}`)) {
                        grid[i][j] = "path";
                    }
                }
            }
            // players.forEach(pl => {

            //     if (grid[pl.position.x][pl.position.y] == "path") {
            //         // grid[pl.position.x][pl.position.y] = pl.id;
            //     } else if (grid[pl.position.x][pl.position.y].includes("bomb")) {
            //         // grid[pl.position.x][pl.position.y] += `-${pl.id}`
            //     }
            // });

            ws.send(JSON.stringify({
                type: "self-update",
                id: movingPlayer.username,
                direction: movingPlayer.direction,
                grid: grid,
                players: players,
                myplayer: myplayer,
                position: position
            }));
            for (const [key, value] of waitingRoom.players.entries()) {
                if (key !== movingPlayer.username) {
                    value.send(JSON.stringify({
                        type: "mouvement",
                        id: movingPlayer.username,
                        direction: movingPlayer.direction,
                        grid: grid,
                        players: players,
                        position: position
                    }));
                }
            }
        }



        if (data.type == "bombPlaced") {
            const bombPosition = { ...data.position };
            grid[bombPosition.x][bombPosition.y] = `bomb`;

            // Reset non-wall/brick tiles to path
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[i].length; j++) {
                    if (grid[i][j] !== "brick" && grid[i][j] !== "wall" && !grid[i][j].includes("bomb") && !powerUps.has(`${i},${j}`)) {
                        grid[i][j] = "path";
                    }
                }
            }

            // Update player positions
            // data.players.forEach(pl => {
            //     if (pl.id != data.username) {
            //         if (grid[pl.position.x][pl.position.y] == "path") {
            //             grid[pl.position.x][pl.position.y] = pl.id;
            //         } else if (grid[pl.position.x][pl.position.y].includes("bomb")) {
            //             grid[bombPosition.x][bombPosition.y] += `-${pl.id}`
            //         }
            //     }
            // });
            for (const [_, value] of waitingRoom.players.entries()) {
                value.send(JSON.stringify({
                    type: "bombPlaced",
                    grid: grid,
                    players: data.players
                }));
            }
            setTimeout(() => {
                grid[bombPosition.x][bombPosition.y] = "path";

                for (const [key, value] of waitingRoom.players.entries()) {
                    value.send(JSON.stringify({
                        type: "bombExploded",
                        position: bombPosition,
                        username: data.username,
                        myplayer: data.myplayer
                    }));
                }
            }, 5000);
        } else if (data.type === "test") {
            // Generate coordinates for each direction based on range
            const range = data.myplayer.range || 1;
            const directions = [];

            const originX = data.bombCorrds.x;
            const originY = data.bombCorrds.y;
            directions.push({ x: originX, y: originY })
            // Up
            for (let i = 1; i <= range; i++) {
                const newX = originX - i;
                if (newX < 0 || grid[newX][originY] === 'wall') break;
                directions.push({ x: newX, y: originY });
            }

            // Down
            for (let i = 1; i <= range; i++) {
                const newX = originX + i;
                if (newX >= tile.board.height || grid[newX][originY] === 'wall') break;
                directions.push({ x: newX, y: originY });
            }

            // Left
            for (let i = 1; i <= range; i++) {
                const newY = originY - i;
                if (newY < 0 || grid[originX][newY] === 'wall') break;
                directions.push({ x: originX, y: newY });
            }

            // Right
            for (let i = 1; i <= range; i++) {
                const newY = originY + i;
                if (newY >= tile.board.width || grid[originX][newY] === 'wall') break;
                directions.push({ x: originX, y: newY });
            }
            // Check each position in the explosion range
            directions.forEach(pos => {

                // Only affect positions within grid bounds
                if (pos.x < tile.height && pos.x > 0 && pos.y < tile.width && pos.y > 0) {
                    if (grid[pos.x][pos.y] === "brick" || grid[pos.x][pos.y] === "path") {
                        if (grid[pos.x][pos.y] === "brick") {
                            const types = [POWERUP_TYPES.SPEED, POWERUP_TYPES.RANGE, POWERUP_TYPES.EXTRABOMB];
                            const type = types[Math.floor(Math.random() * types.length)];
                            powerUps.set(`${pos.x},${pos.y}`, type);
                        }
                        grid[pos.x][pos.y] = 'collision';
                    }
                }
            });

            data.players.forEach(pl => {
                directions.forEach(pos => {

                    // Only affect positions within grid bounds
                    if (pos.x < tile.height && pos.x > 0 && pos.y < tile.width && pos.y > 0) {

                        if (pl.position.x == pos.x && pl.position.y == pos.y) {

                            pl.lives--;
                            data.myplayer = pl
                        }
                    }
                })
                if (pl.lives > 0) {
                    // grid[pl.position.x][pl.position.y] = pl.id
                } else {
                    grid[pl.position.x][pl.position.y] = "path"
                }
            });


            for (const [key, value] of waitingRoom.players.entries()) {
                value.send(JSON.stringify({
                    type: "expo",
                    grid: grid,
                    players: data.players,
                    myplayer: data.myplayer
                }));
            }

            setTimeout(() => {
                for (const [key, value] of waitingRoom.players.entries()) {
                    value.send(JSON.stringify({
                        type: "after_expo1",
                    }));
                }
            }, 1000);
        } else if (data.type == "after_expo2") {
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[i].length; j++) {
                    if (grid[i][j] !== "brick" && grid[i][j] !== "wall" && !grid[i][j].includes("bomb") && !powerUps.has(`${i},${j}`)) {
                        grid[i][j] = "path";
                    }
                }
            }
            // data.players.forEach(pl => {
            //     if (grid[pl.position.x][pl.position.y] == "path") {
            //         // grid[pl.position.x][pl.position.y] = pl.id;
            //     } else {
            //         // grid[pl.position.x][pl.position.y] += `-${pl.id}`
            //     }
            // });

            powerUps.forEach((key, value) => {
                const coords = value.split(',')
                grid[parseInt(coords[0])][parseInt(coords[1])] = key
            })

            for (const [key, value] of waitingRoom.players.entries()) {
                value.send(JSON.stringify({
                    type: "newgrid",
                    grid: grid,
                    players: data.players,
                    myplayer: data.myplayer
                }));
            }
        } else if (data.type == "powerUpCollected") {
            for (const [key, value] of waitingRoom.players.entries()) {
                value.send(JSON.stringify({
                    type: "powerUpCollected2",
                    grid: grid,
                    players: data.players,
                }));
            }
        } else if (data.type == "lose") {
            for (const [key, value] of waitingRoom.players.entries()) {
                if (key === data.myplayer.id) {
                    value.send(JSON.stringify({
                        type: "lose",
                    }));
                }
            }
        } else if (data.type == "win") {
            for (const [key, value] of waitingRoom.players.entries()) {
                if (key === data.myplayer.id) {
                    value.send(JSON.stringify({
                        type: "win",
                    }));
                }
            }
        }
    })

    ws.on("close", () => {

        let userid;

        for (const [key, value] of waitingRoom.players.entries()) {
            value.send(JSON.stringify({
                type: "counter",
                counter: waitingRoom.players.size,
                username: key,
            }));
        }

        for (const [key, value] of waitingRoom.players.entries()) {
            if (value === ws) {
                userid = key
            }
        }

        waitingRoom.removePlayer(userid);
        playersUsernames.delete(username);
        setLength.len = playersUsernames.size;

        if (waitingRoom.players.size === 1) {
            //console.log("hanni");

            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[i].length; j++) {
                    if (grid[i][j] !== "wall") {
                        grid[i][j] = "path";
                    }
                }
            }

            powerUps.clear();

            for (const [key, value] of waitingRoom.players.entries()) {
                value.send(JSON.stringify({
                    type: "gameover",
                }));

            }
            started = false;
            once = true;
            waitingRoom.players.clear();
            playersUsernames.clear();
            waitingRoom.status = "waiting";

        }

    })
})

function updatePosition(direction, position, myplayer, players) {
    if (Obstacles(position, direction)) {
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
    players.forEach((pl) => {
        if (pl.id == myplayer.id) {
            pl.position = position
            pl.direction = direction
        }
    })

    // Check if player moved to a power-up position
    const powerUpKey = `${position.x},${position.y}`;
    if (powerUps.has(powerUpKey)) {
        const powerUpType = powerUps.get(powerUpKey);

        switch (powerUpType) {
            case 'range':
                players.forEach((p) => {
                    if (p.id == myplayer.id && p.range < 4) {
                        grid[position.x][position.y] = "path";
                        p.range += 1;
                    }
                })
                break;
            case 'speed':
                players.forEach((p) => {
                    if (p.id == myplayer.id && p.speed > 100) {
                        grid[position.x][position.y] = "path";
                        p.speed -= 50;
                    }
                })
                break;
            case 'ExtraBomb':
                players.forEach((p) => {
                    if (p.id == myplayer.id && p.bombs > 0) {
                        grid[position.x][position.y] = "path";
                        p.bombs -= 1;
                    }
                })
        }
        powerUps.delete(powerUpKey);
        setTimeout(() => {
            for (const [_, value] of waitingRoom.players.entries()) {
                value.send(JSON.stringify({
                    type: "powerUpCollected",
                    players: players
                }));
            }
        }, 500);
    }
    return { position, players, myplayer }
}


function Obstacles(position, direction) {
    if (started) {
        checkSomething(grid);
        started = false;
    }
    const nextX = position.y + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0);
    const nextY = position.x + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0);

    if ((!grid[nextY][nextX] || grid[nextY][nextX] == "bomb" || grid[nextY][nextX] == "wall" || grid[nextY][nextX] == "brick")) {
        return false;
    }
    return true;
}

server.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});