import { movePlayer } from "./movePlayers.js";
import { useState } from "../Apex/core.js";
import { navigate, Routes } from "../Apex/router.js";

export let players = [];

export function ResetPlayers(ps) {
    players = ps.filter((pl) => {
        return pl.lives > 0
    })
}

export function updatePlayers(ps) {
    players = ps
    // console.log(players);
    
}
export function gameRoom(tile, ws, setMap, setWait, setStart) {
    // console.log("new map ===>", tile);
    // console.log({ players });
    const [error, setError] = useState(false)
    const [routes, SetRoutes] = useState([
        { route: '#/', handler1: () => setWait(true), handler2: () => setGameover(false),handler3: () => setWinner(false), handler4: () => setStart(false), Error: () => setError(false) },
        { route: '', handler: () => setError(true) }
    ])
    Routes(routes)
    const [gameover, setGameover] = useState(false)
    const [winner, setWinner] = useState(false)

    const [gameState, setGameState] = useState({
        players: [],
        bombs: [],
        powerUps: new Map()
    });

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
                            // x++
                            // Add new      player to state
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
                                range: 1,
                                speed: 100,
                                bombs: 6,
                            };
                            players.push(newPlayer);

                            // Initialize myPlayer if this is the current user
                            // if (square === localStorage.getItem("player")) {
                            //     window.myPlayer = newPlayer;
                            // }
                        }
                    }
                    // else if (square.includes("bomb")) {
                    //     bombs.push({
                    //         position: {
                    //             x: i,
                    //             y: j,
                    //         }
                    //     })
                    // }
                });
            }
        });

    }
    console.log({players});
    
    // console.log(x);
    movePlayer(ws, updatePlayerState, setMap, setGameover, setWinner)

    return (
        error ? {
            tag: "div",
            attrs: { class: 'Error' },
            children: [
                {
                    tag: 'p',
                    children: ["Page not found"]
                }, {
                    tag: 'p',
                    children: ['Error 404']
                }
            ]
        } : gameover ? {
            tag: "div",
            attrs: {
                class: "message",
            },
            children: [
                {
                    tag: "p",
                    children: [`You Lose The Game`]
                }, {
                    tag: "button",
                    attrs: {
                        onclick: () => {
                            navigate('#/')
                        }
                    },
                    children: ['Restart The game']
                }
            ]
        } : winner ? {
            tag: "div",
            attrs: {
                class: "message",
            },
            children: [
                {
                    tag: "p",
                    children: [`You Win The Game`]
                }, {
                    tag: "button",
                    attrs: {
                        onclick: () => {
                            navigate('#/')
                        }
                    },
                    children: ['Restart The game']
                }
            ]
        } : {
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
                        } else if (`${square}` === "collision") {
                            return (
                                {
                                    tag: "div",
                                    attrs: {
                                        //src: "./assets/Effect_Explosion_1.gif",
                                        class: "path box",
                                    },
                                    children: [
                                        {
                                            tag: "img",
                                            attrs: {
                                                src: "./assets/Effect_Explosion_1.gif",
                                                class: "collision",
                                            }
                                        }
                                    ]
                                }
                            )
                        } else if (`${square}` === "speed") {
                            return (
                                {
                                    tag: "div",
                                    attrs: {
                                        //src: "./assets/Effect_Explosion_1.gif",
                                        class: "path box",
                                    },
                                    children: [
                                        {
                                            tag: "img",
                                            attrs: {
                                                src: "./assets/speed.png",
                                                class: "collision",
                                            }
                                        }
                                    ]
                                }
                            )
                        } else if (`${square}` === "range") {
                            return (
                                {
                                    tag: "div",
                                    attrs: {
                                        //src: "./assets/Effect_Explosion_1.gif",
                                        class: "path box",
                                    },
                                    children: [
                                        {
                                            tag: "img",
                                            attrs: {
                                                src: "./assets/range.png",
                                                class: "collision",
                                            }
                                        }
                                    ]
                                }
                            )
                        } else if (`${square}` === "ExtraBomb") {
                            return (
                                {
                                    tag: "div",
                                    attrs: {
                                        //src: "./assets/Effect_Explosion_1.gif",
                                        class: "path box",
                                    },
                                    children: [
                                        {
                                            tag: "img",
                                            attrs: {
                                                src: "./assets/extraBomb.png",
                                                class: "collision",
                                            }
                                        }
                                    ]
                                }
                            )
                        }
                        else {
                            if (!square.includes("bomb")) {
                                const player = players.find(p => p.id === square);
                                if (player) {
                                    return {
                                        tag: "div",
                                        attrs: {
                                            class: "path box",
                                        },
                                        children: [
                                            createPlayer(player)
                                        ]
                                    }
                                }
                            } else {
                                const slice = square.split("-");
                                // console.log(slice.length);
                                if (slice.length == 2) {
                                    const player = players.find(p => p.id === slice[1]);
                                    if (player) {
                                        return {
                                            tag: "div",
                                            attrs: {
                                                class: "path box",
                                            },
                                            children: [
                                                createBomb(i, j),
                                                createPlayer(player)
                                            ]
                                        }
                                    }
                                } else {
                                    return {
                                        tag: "div",
                                        attrs: {
                                            class: "path box",
                                        },
                                        children: [
                                            createBomb(i, j)
                                        ]
                                    }
                                }

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
        }

    );
}

let first = true;

export function createPlayer(player) {
    // let x = player.position.x;
    // let y = player.position.y;
    // if (first) {
    //     first = false;
    //     x = 5;
    //     y = 5; 
    // }
    return {
        tag: "div",
        attrs: {
            class: "Character",
            // id: player.id,
            style: `top: ${player.position.x * 50}px; left: ${player.position.y * 50}px;
            transition: left ${player.speed}ms ease-out, top ${player.speed}ms ease-out;`,
        },
        children: [
            {
                tag: "p",
                attrs: {
                    class: "labelP"
                },
                children: [`❤️ ${player.lives}`]
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
    }

}

export function createBomb(x, y) {

    return {
        attrs: {
            class: "Bomber",
            style: `height: 50px; width: 50px; position: absolute; top: ${x * 50}px; left: ${y * 50}px`
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
    }

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
