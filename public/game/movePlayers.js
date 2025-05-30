import { players, updatePlayers, ResetPlayers } from "./gameRoom.js";
// import { render } from "../Apex/dom.js";

// const POWERUP_CHANCE = 0.5;
// const speed = 5;
// let lastKey;
let myPlayer;

// At the top with other constants
// const POWERUP_TYPES = {
//     SPEED: 'speed',
//     RANGE: 'range',
//     EXTRABOMB: 'ExtraBomb'
// };
const directions = {
    keyUp: "up",
    keyDown: "down",
    keyLeft: "left",
    keyRight: "right",
    keySpace: "space"
}

// const keys = {
//     w: {
//         pressed: false
//     },
//     a: {
//         pressed: false
//     },
//     s: {
//         pressed: false
//     },
//     d: {
//         pressed: false
//     }
// }

// let playerElement
function movingPlayerAnimation() {
    if (players.length > 0) {
        players.forEach(player => {
            if (player.id == localStorage.getItem("player")) {
                // player.direction = direction;
                // player.bombRange = player.bombRange || 1; // Initialize bomb range
                myPlayer = player;
                // console.log(player);
                
                Time_Between_Bombs = player.bombs
                // console.log({ Time_Between_Bombs });

            }
        });
    }
}

// function updatingPlayer(newPlayer) {
//     if (players.length > 0) {
//         players.forEach(player => {
//             if (player.id == localStorage.getItem("player")) {
//                 // player.direction = direction;
//                 // player.bombRange = player.bombRange || 1; // Initialize bomb range
//                 player = newPlayer;
//             }
//         });
//     }
// }

export function movePlayer(ws, updatePlayerState, setMap, setGameover, setWinner) {
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type == "gameover") {
            console.log("l7wa");

            ws.close();
            updatePlayers([])
            setMap([])
            setWinner(true)
            return;
        }
        if (data.type === "mouvement") {
            // console.log({ players: data.players });

            players.forEach(player => {
                if (player.id == data.id) {
                    player.position = data.position;
                    player.direction = data.direction;
                }
                updatePlayerState(data.players)

            });
            updatePlayers(data.players);
            // setMap(data.grid);
        }
        else if (data.type === "self-update") {
            myPlayer.position = data.position;
            myPlayer.direction = data.direction;
            // console.log(data.myplayer);

            updatePlayerState(data.myplayer)
            updatePlayers(data.players);
            // setMap(data.grid);
        }
        else if (data.type === "bombPlaced") {
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
        } else if (data.type == "expo") {
            // console.log("new grid ==>", data.grid)
            // console.log({DP: data.myplayer});
            // console.log({myPlayer});
            
            // if (data.myplayer)
            updatePlayers(data.players);
            movingPlayerAnimation()
            // console.log({ALL:data.players});
            
            // console.log({Me:myPlayer});

            if (myPlayer.lives == 0) {
                ws.send(JSON.stringify({
                    type: "lose",
                    myplayer: myPlayer
                }))
                
                // ws.close();
            }
            ResetPlayers(data.players)
            if (players.length == 1) {
                ws.send(JSON.stringify({
                    type: "win",
                    myplayer: myPlayer
                }))
            }
            // updatePlayerState(data.myplayer)
            setMap(data.grid);
        } else if (data.type === "after_expo1") {
            movingPlayerAnimation(' ', ' ', directions.keySpace);
            ws.send(JSON.stringify({
                type: 'after_expo2',
                players: players,
                myplayer: myPlayer
            }));

        } else if (data.type === "newgrid") {
           
            console.log({newgrid:data.grid});
            
           
            updatePlayers(data.players);
            // updatePlayerState(data.myplayer)
            setMap(data.grid);
        }
        else if (data.type === "powerUpCollected") {
            ws.send(JSON.stringify({
                type: 'powerUpCollected',
                players: players,
                myplayer: myPlayer
            }));
            updatePlayers(data.players);
            // updatePlayerState(data.myplayer)
            // setMap(data.grid);
        }
        else if (data.type === "powerUpCollected2") {
            // ws.send(JSON.stringify({
            //     type: 'powerUpCollected',
            //     players: players,
            //     myplayer: myPlayer
            // }));
            // console.log();
            
            // console.log({ PP: data.players });

            updatePlayers(data.players);
            // updatePlayerState(data.myplayer)
            setMap(data.grid);
        }else if (data.type == "lose") {
            ws.close();
            updatePlayers([])
            setMap([])
            setGameover(true)
        }else if (data.type == "win") {
            ws.close();
            updatePlayers([])
            setMap([])
            setWinner(true)
        }
    }


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
                movingPlayerAnimation(event.key, event.key, directions.keySpace);
                // console.log({ Time_Between_Bombs });

                bombing(ws, myPlayer)
                break;
        }
    };
}

let lastBombTime = 0;
let Time_Between_Bombs = 5;
function bombing(ws, myplayer) {
   const currentTime = Date.now();
   const requiredDelay = Time_Between_Bombs * 1000;
   
   if (currentTime - lastBombTime >= requiredDelay) {
      movingPlayerAnimation(' ', ' ', directions.keySpace);
      
      if (myplayer) {
        //  console.log("hanni", myplayer.bombs);
         Time_Between_Bombs = myplayer.bombs;
      }

      ws.send(JSON.stringify({
         type: 'bombPlaced',
         bomb: true,
         position: myplayer.position,
         lastKey: 'Space',
         username: myplayer.id,
         players: players,
         myplayer: myplayer,
      }));
      
      lastBombTime = currentTime;
   }
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