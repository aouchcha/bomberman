import { players, ResetPlayers, ResetPlayers2 } from "./gameRoom.js";
import { render } from "../Apex/dom.js";

const POWERUP_CHANCE = 0.5;
const speed = 5;
let lastKey;
let myPlayer;

// At the top with other constants
const POWERUP_TYPES = {
    SPEED: 'speed',
    RANGE: 'range',
    EXTRABOMB: 'ExtraBomb'
};
const directions = {
    keyUp: "up",
    keyDown: "down",
    keyLeft: "left",
    keyRight: "right",
    keySpace: "space"
}

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

// let playerElement
function movingPlayerAnimation(direction) {
    if (players.length > 0) {
        players.forEach(player => {
            if (player.id == localStorage.getItem("player")) {
                // player.direction = direction;
                // player.bombRange = player.bombRange || 1; // Initialize bomb range
                myPlayer = player;
            }
        });
    }
}

function updatingPlayer(newPlayer) {
    if (players.length > 0) {
        players.forEach(player => {
            if (player.id == localStorage.getItem("player")) {
                // player.direction = direction;
                // player.bombRange = player.bombRange || 1; // Initialize bomb range
                player = newPlayer;
            }
        });
    }
}

export function movePlayer(ws, updatePlayerState, setMap) {
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type == "xxx") {
            console.log("l7wa");

            ResetPlayers2(players, data.username)
            updatePlayerState(players)
            return;
        }
        if (data.type === "mouvement") {
            players.forEach(player => {
                if (player.id == data.id) {
                    player.position = data.position;
                    player.direction = data.direction;
                }
                updatePlayerState(player)

            });
        } else if (data.type === "self-update") {
            myPlayer.position = data.position;
            myPlayer.direction = data.direction;
            updatePlayerState(myPlayer)
        } else if (data.type === "bombPlaced") {
            console.log({ grid: data.grid });
            setMap(data.grid)
        }
        else if (data.type === "bombExploded") {
            ws.send(JSON.stringify({
                type: 'test',
                bomb: true,
                players: players,
                bombCorrds: data.position,
                myplayer: data.myplayer,
            }));
        }else if (data.type == "newgrid1") {
            setMap(data.grid);
        } else if (data.type === "newgrid2") {
            console.log("new grid ==>", data.grid)
            ResetPlayers(data.players);
            setMap(data.grid);
        }
        else if (data.type === "powerUpCollected") {
            ResetPlayers(data.players);
            updatePlayerState(data.myplayer)
            setMap(data.grid);
        }
    }
    const bombing = throttle(function () {
        movingPlayerAnimation(' ', ' ', directions.keySpace);
        ws.send(JSON.stringify({
            type: 'bombPlaced',
            bomb: true,
            position: myPlayer.position,
            lastKey: 'Space',
            username: myPlayer.id,
            players: players,
            myplayer: myPlayer,

        }));
    }, 5000)

    document.onkeydown = (event) => {
        switch (event.key) {
            case 'ArrowUp':
                movingPlayerAnimation(event.key, event.key, directions.keyUp);
                ws.send(JSON.stringify({
                    type: 'move',
                    direction: directions.keyUp,
                    position: myPlayer.position,
                    username: myPlayer.id,
                    lastKey: 'z',
                    myplayer: myPlayer,
                    players: players
                }));
                break;
            case 'ArrowLeft':
                movingPlayerAnimation(event.key, event.key, directions.keyLeft);
                ws.send(JSON.stringify({
                    type: 'move',
                    direction: directions.keyLeft,
                    position: myPlayer.position,
                    username: myPlayer.id,
                    lastKey: 'a',
                    myplayer: myPlayer,
                    players: players
                }));
                break;
            case 'ArrowDown':
                movingPlayerAnimation(event.key, event.key, directions.keyDown);
                ws.send(JSON.stringify({
                    type: 'move',
                    direction: directions.keyDown,
                    position: myPlayer.position,
                    username: myPlayer.id,
                    lastKey: 's',
                    myplayer: myPlayer,
                    players: players
                }));
                break;
            case 'ArrowRight':
                movingPlayerAnimation(event.key, event.key, directions.keyRight);
                ws.send(JSON.stringify({
                    type: 'move',
                    direction: directions.keyRight,
                    position: myPlayer.position,
                    username: myPlayer.id,
                    lastKey: 'd',
                    myplayer: myPlayer,
                    players: players
                }));
                break;
            case ' ':
                bombing()
                break;
        }
    };
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