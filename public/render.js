import { Chat } from './Chat.js';
import { createBackgroundMusic, createLivesDisplay, createMusicToggleButton, gameRoom } from './game/gameRoom.js';
import { useState } from './Apex/core.js';

// Store the current message handler and chat history
let currentMessageHandler = null;
let gamestarted = false;
let currUser;

export function waitingRoom(ws) {
    const [timer, setTimer] = useState('Waiting...');
    const [users, setUsers] = useState([]);
    const [nb, setNb] = useState('');
    const [chat, setChat] = useState([]);
    const [start, setStart] = useState(false);
    const [map, setMap] = useState();

    const manageMsgs = {
        timer: (data) => {
            //console.log("waiting room data =>", data)
            setTimer(`Game starting in: ${data.time} seconds...
                `)
            setNb(`players waiting : ${data.playersNumber}`)
        },
        postCountdown: (data) => {
            //console.log("post count down ===>", data)
            // data.usernames.forEach(u => {
            // });
            setTimer(`Game starting soon: ${data.time} seconds...\n
                    `)
            setNb(`players ready: ${data.playersNumber}`)
            //setUsers(data.usernames)
        },
        grid: (data) => {
            //console.log("map ==<", data.map)
            if (data.players.length >= 2 && data.players.length <= 4) {
                gamestarted = true;
                ws.send(JSON.stringify({
                    type: "gamestarted",
                    started: gamestarted
                }))
                setStart(true)
                setMap(data.map)
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

        // xxx: (data) => {
        //     //alert(data)
        // },
        // playerLives: (data) => {
        //     console.log("data of lives =>", data);
        // }

    }
    if (currentMessageHandler) {
        ws.removeEventListener("message", currentMessageHandler);
    }
    currentMessageHandler = (e) => {
        const data = JSON.parse(e.data);
        if (data.type == "xxx") {
            //console.log("OVEEEEEEEEEEEEEEEEEEEEEEEEEEEER");
            // players.filter(player => {
            //     player.username == data.username
            // });
            // updatePlayerState(players)
            return;
        }
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
            attrs: {
                class: 'container'
            },
            children: [
                {
                    tag: "div",
                    attrs: {
                        class: "timer-container",
                    },
                    children: [timer, nb],
                },
                Chat(chat, ws, start)
            ],
        } : {
            tag: "div",
            children: [
                Chat(chat, ws, start),
                createBackgroundMusic(),
                createMusicToggleButton(),
                createLivesDisplay(ws),
                gameRoom(map, ws, setMap)
            ]
        }
    )
}