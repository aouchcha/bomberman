import { tile } from "./game/tile.js";
import { createPlayer } from "./utils.js";

const waitTimer = 4;
const readyTimer = 1;

export class WaitingRoom {
    constructor() {
        this.players = new Map();
        this.status = 'waiting';
        this.timerDuration = waitTimer;
        this.postCountdown = readyTimer;
        this.timer = null;
    }

    addPlayer(player) {
        // console.log({name:player.username});
        
        if (this.players.size == 2 && this.status == 'waiting') {
            this.startTimer();
        }

        // this.players.set(player.username, { socket: player.socket, send: player.send });
        this.players.set(player.username, player.soket);

        if (this.status === 'postCountdown') {
            this.removePlayer(player)
        }
        // console.log("players ====>", this.players)
    }
    removePlayer(playerId) {
        // console.log("playerId ===>", playerId)
        // const username = [...this.players.keys()].find(key => this.players.get(key) === playerId.xx);
        // console.log("pid ==> ", username)
        // const removedPlayer = this.players.get(username);
        // console.log("removedPlayer ===>", removedPlayer.socket)
        // const username = playerId.get()
        this.players.delete(playerId);
        console.log(`Player ${playerId} removed from the waiting room.`);
        if (this.players.size < 2) {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.status = 'waiting';
            this.timerDuration = readyTimer;
            this.broadcast({
                type: 'timer',
                status: "waiting",
                time: this.timerDuration,
            });
        }
        console.log("players in remove player ====>", this.players.size)
    }

    broadcast(message) {
        const msg = JSON.stringify(message);
        // console.log( this.players.values());
        for (const player of this.players.values()) {
            player.send(msg);
        }
    }

    startTimer() {
        if (this.timer) return;
        this.status = 'countdown';

        this.timer = setInterval(() => {
            if (this.players.size == 4) {
                this.stopTimer();
                this.onCountdownEnd();
            }

            this.broadcast({
                type: 'timer',
                time: this.timerDuration,
                status: this.status,
            });

            this.timerDuration--;

            if (this.timerDuration < 0) {
                this.stopTimer();
                this.onCountdownEnd();
            }
        }, 1000);
        this.timerDuration = waitTimer;
    }

    startPostCountdown() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.status = 'postCountdown';
        this.timerDuration = this.postCountdown;

        this.timer = setInterval(() => {
            this.broadcast({
                type: 'postCountdown',
                time: this.timerDuration,
                status: this.status,
            });

            this.timerDuration--;

            if (this.timerDuration < 0) {
                this.stopTimer();
                this.onGameStart();
            }
        }, 1000);
        this.postCountdown = readyTimer;
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    onCountdownEnd() {
        this.startPostCountdown();
    }

    onGameStart() {
        // console.log("grid jdida !!!!")
        this.status = 'grid';
        // console.log({hh:tile.board[1]});
        
        //console.log(`onGameStart ====> size = ${this.players.size} , `, [...this.players.keys()])
        this.broadcast({
            type: "grid",
            players: [...this.players.keys()].map(p => ({ username: p.username })),
            map: createPlayer(tile.board, this.players.size, [...this.players.keys()]),
            position: { x: 1, y: 1 },
        });
    }
}
