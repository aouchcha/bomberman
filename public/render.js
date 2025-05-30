import { Chat } from './Chat.js';
import { createBackgroundMusic, createLivesDisplay, createMusicToggleButton, gameRoom } from './game/gameRoom.js';
import { useState } from './Apex/core.js';

// Store the current message handler and chat history
let currentMessageHandler = null;
let gamestarted = false;
let currUser;

export function waitingRoom(ws, setWait) {
    const [timer, setTimer] = useState('Waiting...');
    const [chat, setChat] = useState([]);
    const [start, setStart] = useState(false);
    const [map, setMap] = useState();

    const manageMsgs = {
        timer: (data) => {
            setTimer(`Game starting in: ${data.time} seconds...`)
        },
        postCountdown: (data) => {
            setTimer(`Game starting very soon: ${data.time} seconds...`)
        },
        grid: (data) => {
            console.log("map ==<", data.map)
            console.log("ALGAAAAAAAAAAAAAAAAAa");
            if (data.players.length >= 2 && data.players.length <= 4) {

                gamestarted = true;
                ws.send(JSON.stringify({
                    type: "gamestarted",
                    started: gamestarted
                }))
                setMap(data.map)
                setStart(true)
            } else {
                console.log("The time allowed for new players to enter has passed.");
            }
        },
        waiting: (data) => {
            setTimer("Waiting for more players...")
        },
        chat: (data) => {
            // if (!chat.includes(data.message)) {
            setChat((prev) => [...prev, data.message])
            // }
        },

        xxx: (data) => {
            //alert(data)
            console.log(data);
        }

    }
    if (currentMessageHandler) {
        ws.removeEventListener("message", currentMessageHandler);
    }
    currentMessageHandler = (e) => {
        const data = JSON.parse(e.data);
        // if (data.type == "xxx") {
        //     //console.log("OVEEEEEEEEEEEEEEEEEEEEEEEEEEEER");
        //     // players.filter(player => {
        //     //     player.username == data.username
        //     // });
        //     // updatePlayerState(players)
        //     return;
        // }
        const handler = manageMsgs[data.type];
        if (handler) {
            handler(data);
        }
    };

    // Add the new message handler
    ws.onmessage = (e) => currentMessageHandler(e);
    return (
        !start ? {
            tag: "div",
            children: [
                {
                    tag: "div",
                    attrs: {
                        class: "timer-container",
                    },
                    children: [timer]
                },
                Chat(chat, ws, start)
            ]
        } : {
            tag: "div",
            children: [
                Chat(chat, ws, start),
                createBackgroundMusic(),
                createMusicToggleButton(),
                gameRoom(map, ws, setMap, setWait, setStart)
            ]
        }
    )
}