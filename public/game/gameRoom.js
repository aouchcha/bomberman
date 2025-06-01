import { movePlayer } from "./movePlayers.js";
import { useState } from "../Apex/core.js";
import { Routes } from "../Apex/router.js";

export let players = [];
// export let move = false;
export function ResetPlayers(ps) {
    players = ps.filter((pl) => {
        return pl.lives > 0
    })
}

export function updatePlayers(ps) {
    players = ps
}
export function gameRoom(tile, ws, setMap, setWait, setStart, winner, setWinner) {

    const [error, setError] = useState(false)
    const [routes, SetRoutes] = useState([
        { route: '#/', handler1: () => setWait(true), handler2: () => setGameover(false), handler3: () => setWinner(false), handler4: () => setStart(false), Error: () => setError(false) },
        { route: '', handler: () => setError(true) }
    ])
    Routes(routes)
    const [gameover, setGameover] = useState(false)


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
                                range: 1,
                                speed: 250,
                                bombs: 6,
                            };
                            players.push(newPlayer);
                        }
                    }
                });
            }
        });

    }
//    window.requestAnimationFrame(
    movePlayer(ws, updatePlayerState, setMap, setGameover, setWinner)
// )

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
                            setWait(true),
                                setGameover(false),
                                setWinner(false),
                                setStart(false)
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
                            setWait(true),
                                setGameover(false),
                                setWinner(false),
                                setStart(false)
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
                                const slice = square.split("-")
                                return {
                                    tag: "div",
                                    attrs: {
                                        class: "path box",
                                    },
                                    children: [
                                        ...slice.map((pl, i) => {
                                            const player = players.find(p => p.id === pl);
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
                                        })
                                    ]
                                }
                            } else {
                                const slice = square.split("-");
                                if (slice.length > 1) {
                                    return {
                                        tag: "div",
                                        attrs: {
                                            class: "path box",
                                        },
                                        children: [
                                            createBomb(i, j),
                                            ...slice.slice(1).map((pl, i) => {
                                                const player = players.find(p => p.id === pl);
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
                                            })
                                        ]
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
                        }
                    }) : []
                })) : [])
            ]
        }

    );
}

export function createPlayer(player) {
    return {
        tag: "div",
        attrs: {
            class: "Character",
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
                    class: `Character_spritesheet pixelart face-${player.direction}-move`,
                    src: "assets/redLink.png",
                    alt: "Character",
                }
            }
        ]
    }

}

export function createBomb(x, y) {

    return {
        tag: "div",
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
