import { movePlayer } from "./movePlayers.js";
import { useState } from "../Apex/core.js";
import { render } from "../Apex/dom.js";

export let players = [];
export let bombs = []
let i = 0
const sizes = {
    width: 50,
    height: 50,
}

export function FilterBombs() {
    bombs = bombs.filter(bomb =>
        bomb.x !== data.position.x || bomb.y !== data.position.y
    );
}

export function AddBomb(bomb) {
    bombs.push(bomb)
}

export function ResetPlayers(ps) {
    players = ps.filter((pl) => {
        return pl.lives > 0
    })
}
export function ResetPlayers2(ps, username) {
    console.log("ps", ps);
    console.log("username", username)
    players = ps.filter((pl) => {
        return pl.id == username;
    })
}
export function gameRoom(tile, ws, setMap) {
    const [gameState, setGameState] = useState({
        players: [],
        bombs: [],
        powerUps: new Map()
    });
    if (players.length == 1) {
        document.querySelector(".root").appendChild(render({
            tag: "div",
            attrs: {
                class: "message",
            },
            children: [`Player ${players[0].id} win, the game restart in 5 seconds`]
        }))
        ws.close()
    }
    const updatePlayerState = (updatedPlayer) => {
        setGameState(prevState => ({
            ...prevState,
            players: updatedPlayer,
        }));
    };

    // Initialize players from tile map
    if (tile && players.length === 0) {

        tile.forEach((row, i) => {
            if (row) {
                row.forEach((square, j) => {

                    // If the square contains a player ID
                    if (square !== "path" && square !== "brick" && square !== "wall" && square !== "bomb") {

                        // Check if this player doesn't exist in our state yet
                        if (!players.find(p => p.username === square)) {

                            // Add new player to state
                            const newPlayer = {
                                position: {
                                    x: i,
                                    y: j
                                },
                                velocity: {
                                    x: 0,
                                    y: 0
                                },
                                id: square,
                                direction: "down",
                                lives: 3,
                            };
                            players.push(newPlayer);

                            // Initialize myPlayer if this is the current user
                            if (square === localStorage.getItem("player")) {
                                window.myPlayer = newPlayer;
                            }
                        }
                    }
                });
            }
        });

    }
    movePlayer(ws, updatePlayerState, setMap, setGameState)

    return {
        tag: "div",
        attrs: {
            class: "container",
        },
        children: [
            // Render the grid
            ...(tile ? tile.map((row, i) => ({
                tag: "div",
                attrs: {
                    class: "row",
                },
                children: row ? row.map((square, j) => {
                    // Render path tiles
                    if (`${square}` === "path") {
                        return {
                            tag: "div",
                            attrs: {
                                style: "background-color: green;",
                                class: "path box",
                            }
                        };
                    }
                    // Render brick tiles
                    else if (`${square}` === "brick") {
                        return {
                            tag: "div",
                            attrs: {
                                style: "background-color: yellow;",
                                class: `brick y-${i} x-${j}`,
                            }
                        };
                    }
                    // Render wall tiles
                    else if (`${square}` === "wall") {
                        return {
                            tag: "div",
                            attrs: {
                                style: "background-color: grey;",
                                class: "wall box",
                            }
                        };
                    } else {
                        const player = players.find(p => p.id === square);
                        if (player) {
                            return createPlayer(player);
                        }
                        return {
                            tag: "div",
                            attrs: {
                                class: "path box"
                            }
                        };
                    }
                }) : []
            })) : [])
        ]
    };
}


export function createPlayer(player) {

    return {
        tag: "div",
        attrs: {
            class: "path box",
        },
        children: [
            {
                tag: "div",
                attrs: {
                    class: "Character",
                    // id: player.id,
                    style: `position: absolute; top: ${player.position.x * 50}px; left: ${player.position.y * 50}px;`,
                },
                children: [
                    {
                        tag: "p",
                        attrs: {
                            class: "labelP"
                        },
                        children: [player.id]
                    },
                    {
                        tag: "img",
                        attrs: {
                            class: `Character_spritesheet pixelart face-${player.direction}`,
                            src: "assets/redLink.png",
                            alt: "Character",
                        }
                    }
                ]
            },
        ]
    };
}
export function createLivesDisplay(ws) {
    const [lives, setLives] = useState(0);

    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "PlayerLives") {
            setLives(data.live);
        }
    });

    return {
        tag: "div",
        attrs: {
            class: "lives-display",
        },
        children: [
            {
                tag: "div",
                attrs: {
                    class: "lives-container",
                },
                children: [
                    {
                        tag: "span",
                        attrs: { class: "lives-icon" },
                        children: ["❤️"],
                    },
                    {
                        tag: "span",
                        attrs: { class: "lives-count" },
                        children: [String(lives)],
                    }
                ]
            }
        ]
    }
}


export function createBackgroundMusic() {
    return {
        tag: "audio",
        attrs: {
            id: "bg-music",
            preload: "auto",
            loop: true,
            onerror: (e) => {
                const musicToggle = document.getElementById('music-toggle');
                console.error('Error loading audio:', e);
                if (musicToggle) {
                    musicToggle.textContent = '❌ Music Error';
                    musicToggle.disabled = true;
                }
            }
        },
        children: [
            {
                tag: "source",
                attrs: {
                    src: "./music/ShoebodyBop.mp3",
                    type: "audio/mpeg",
                },
            }
        ]
    };
}

export function createMusicToggleButton() {
    return {
        tag: "button",
        attrs: {
            id: "music-toggle",
            class: "music-button",
            onclick: () => {
                const music = document.getElementById('bg-music');
                const musicToggle = document.getElementById('music-toggle');
                if (!music) return;

                if (music.paused) {
                    music.play().then(() => {
                        musicToggle.textContent = '🔇 Stop Music';
                    }).catch((error) => {
                        console.error('Audio playback failed:', error);
                        musicToggle.textContent = '❌ Play Failed';
                    });
                } else {
                    music.pause();
                    musicToggle.textContent = '🔊 Play Music';
                }
            }
        },
        children: ["🔊 Play Music"],
    };
}
