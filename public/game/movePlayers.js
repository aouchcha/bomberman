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
function movingPlayerAnimation(key, pressedKey, direction) {
    if (players.length > 0) {
        players.forEach(player => {
            if (player.id == localStorage.getItem("player")) {
                player.direction = direction;
                player.bombRange = player.bombRange || 1; // Initialize bomb range
                myPlayer = player;
            }
        });
    }
}

export function movePlayer(ws, updatePlayerState, setMap, setGameState) {
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
            const Bomb = render({
                tag: "div",
                attrs: {
                    class: "Bomber",
                    style: `height: 50px; width: 50px; position: absolute; top: ${data.position.x * 50}px; left: ${data.position.y * 50}px`
                },
                children: [
                    {
                        tag: "img",
                        attrs: {
                            class: "bomber_spritesheet pixelart",
                            src: "assets/bomb.png",
                            alt: "Bomb"
                        }
                    }
                ]
            })
            document.querySelector(".container").appendChild(Bomb)
            setTimeout(() => {
                Bomb.remove()
            }, 5000);
        }
        else if (data.type === "bombExploded") {
            const bombRange = (data.username === myPlayer?.id ? myPlayer.bombRange : 1) * 50; // Convert range to pixels
            const explosion = render({
                tag: "div",
                attrs: {
                    class: "explosion",
                    style: `position: absolute; top: ${data.position.x * 50}px; left: ${data.position.y * 50}px;`
                },
                children: [
                    // Center explosion
                    {
                        tag: "div",
                        attrs: {
                            class: "explosion-center"
                        }
                    },
                    // Right ray
                    {
                        tag: "div",
                        attrs: {
                            class: "explosion-ray horizontal",
                            style: `left: 50px; width: ${bombRange}px;`
                        }
                    },
                    // Left ray
                    {
                        tag: "div",
                        attrs: {
                            class: "explosion-ray horizontal",
                            style: `right: 50px; width: ${bombRange}px; transform-origin: right;`
                        }
                    },
                    // Down ray
                    {
                        tag: "div",
                        attrs: {
                            class: "explosion-ray vertical",
                            style: `top: 50px; height: ${bombRange}px;`
                        }
                    },
                    // Up ray
                    {
                        tag: "div",
                        attrs: {
                            class: "explosion-ray vertical",
                            style: `bottom: 50px; height: ${bombRange}px; transform-origin: bottom;`
                        }
                    }
                ]
            });

            document.querySelector(".container").appendChild(explosion);

            // Remove explosion effect after animation
            setTimeout(() => {
                explosion.remove();
            }, 500);

            ws.send(JSON.stringify({
                type: 'test',
                bomb: true,
                players: players,
                bombCorrds: data.position,
                range: data.username === myPlayer?.id ? myPlayer.bombRange : 1 // Send range to server
            }));
        } else if (data.type === "newgrid") {
            ResetPlayers(data.players);
            setMap(data.grid);
        } else if (data.type === "powerUpSpawned") {
            const PowerUp = render({
                tag: "div",
                attrs: {
                    class: "PowerUp",
                    style: `height: 30px; width: 30px; position: absolute; top: ${data.position.x * 50 + 10}px; left: ${data.position.y * 50 + 10}px`
                },
                children: [{
                    tag: "div",
                    attrs: {
                        class: `powerup-orb ${data.powerUpType}`,
                        style: "width: 100%; height: 100%; animation: pulse 1s infinite"
                    }
                }]
            });

            document.querySelector(".container").appendChild(PowerUp);

            // Store power-up reference for removal later
            setGameState(prevState => ({
                ...prevState,
                powerUps: new Map(prevState.powerUps).set(`${data.position.x},${data.position.y}`, {
                    type: data.powerUpType,
                    element: PowerUp
                })
            }));
        } else if (data.type === "powerUpCollected") {
            // Remove power-up element
            const powerUpKey = `${data.position.x},${data.position.y}`;
            setGameState(prevState => {
                const powerUps = new Map(prevState.powerUps);
                const powerUp = powerUps.get(powerUpKey);
                if (powerUp?.element) {
                    powerUp.element.remove();
                }
                powerUps.delete(powerUpKey);
                return {
                    ...prevState,
                    powerUps: powerUps
                };
            });

            // Apply power-up effect if it's the current player
            if (window.myPlayer && data.playerId === window.myPlayer.id) {
                if (data.powerUpType === POWERUP_TYPES.SPEED) {
                    window.myPlayer.speed = (window.myPlayer.speed || 1) * 1.5;
                } else if (data.powerUpType === POWERUP_TYPES.RANGE) {
                    window.myPlayer.bombRange = (window.myPlayer.bombRange || 1) + 1;
                }
            }
        }
    }
    const bombing = throttle(function () {
        movingPlayerAnimation(' ', ' ', directions.keySpace);
        ws.send(JSON.stringify({
            type: 'bombPlaced',
            bomb: true,
            position: myPlayer.position,
            lastKey: 'Space',
            username: myPlayer.id
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
                }));
                break;
            case 'ArrowLeft':
                movingPlayerAnimation(event.key, event.key, directions.keyLeft);
                ws.send(JSON.stringify({
                    type: 'move',
                    direction: directions.keyLeft,
                    position: myPlayer.position,
                    username: myPlayer.id,
                    lastKey: 'a'
                }));
                break;
            case 'ArrowDown':
                movingPlayerAnimation(event.key, event.key, directions.keyDown);
                ws.send(JSON.stringify({
                    type: 'move',
                    direction: directions.keyDown,
                    position: myPlayer.position,
                    username: myPlayer.id,
                    lastKey: 's'
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