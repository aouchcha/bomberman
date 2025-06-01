import { players, updatePlayers, ResetPlayers } from "./gameRoom.js";

let myPlayer;


const directions = {
    keyUp: "up",
    keyDown: "down",
    keyLeft: "left",
    keyRight: "right",
    keySpace: "space"
}


function movingPlayerAnimation() {
    if (players.length > 0) {
        players.forEach(player => {
            if (player.id == localStorage.getItem("player")) {
                myPlayer = player;
                Time_Between_Bombs = player.bombs
            }
        });
    }
}

export function movePlayer(ws, updatePlayerState, setMap, setGameover, setWinner) {
    ws.onmessage = (event) => {
        if (localStorage.getItem('player') === undefined) {
            movingPlayerAnimation();
            ws.send(JSON.stringify({
                type: "lose",
                myplayer: myPlayer
            }))
            return
        }
        const data = JSON.parse(event.data);
        if (data.type == "gameover") {
            ws.close();
            updatePlayers([])
            setMap([])
            setWinner(true)
            return;
        }
        if (data.type === "mouvement") {
            players.forEach(player => {
                if (player.id == data.id) {
                    player.position = data.position;
                    player.direction = data.direction;
                }
                updatePlayerState(data.players)

            });
            updatePlayers(data.players);
        }
        else if (data.type === "self-update") {
            myPlayer.position = data.position;
            myPlayer.direction = data.direction;

            updatePlayerState(data.myplayer)
            updatePlayers(data.players);
        }
        else if (data.type === "bombPlaced") {
            updatePlayers(data.players)
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

            updatePlayers(data.players);
            movingPlayerAnimation()

            if (myPlayer.lives == 0) {
                ws.send(JSON.stringify({
                    type: "lose",
                    myplayer: myPlayer
                }))
            }
            ResetPlayers(data.players)
            if (players.length == 1) {
                ws.send(JSON.stringify({
                    type: "win",
                    myplayer: myPlayer
                }))
            }
            setMap(data.grid);
        } else if (data.type === "after_expo1") {
            movingPlayerAnimation();
            ws.send(JSON.stringify({
                type: 'after_expo2',
                players: players,
                myplayer: myPlayer
            }));

        } else if (data.type === "newgrid") {
            updatePlayers(data.players);
            setMap(data.grid);
        }
        else if (data.type === "powerUpCollected") {
            ws.send(JSON.stringify({
                type: 'powerUpCollected',
                players: players,
                myplayer: myPlayer
            }));
            updatePlayers(data.players);
        }
        else if (data.type === "powerUpCollected2") {
            updatePlayers(data.players);
            setMap(data.grid);
        } else if (data.type == "lose") {
            ws.close();
            updatePlayers([])
            setMap([])
            setGameover(true)
        } else if (data.type == "win") {
            ws.close();
            updatePlayers([])
            setMap([])
            setWinner(true)
        }

    }


    document.onkeyup = (event) => {

        switch (event.key) {
            case 'ArrowUp':


                movingPlayerAnimation();
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



                movingPlayerAnimation();
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



                movingPlayerAnimation();
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


                movingPlayerAnimation();
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

                movingPlayerAnimation();
                bombing(ws, myPlayer)
                break;
        }

    }






}

let lastBombTime = 0;
let Time_Between_Bombs = 5;

function bombing(ws, myplayer) {
    const currentTime = Date.now();
    const requiredDelay = Time_Between_Bombs * 1000;

    if (currentTime - lastBombTime >= requiredDelay) {
        movingPlayerAnimation();

        if (myplayer) {
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
