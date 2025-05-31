import { Chat } from './Chat.js';
import { createBackgroundMusic, createMusicToggleButton, gameRoom } from './game/gameRoom.js';
import { useState } from './Apex/core.js';

// Store the current message handler and chat history
let currentMessageHandler = null;
let gamestarted = false;

export function waitingRoom(ws, setWait) {
    const [timer, setTimer] = useState('Waiting...');
    const [chat, setChat] = useState([]);
    const [start, setStart] = useState(false);
    const [map, setMap] = useState();
    const [playerCount, setPlayerCount] = useState(1);

    const manageMsgs = {
        timer: (data) => {
            setTimer(`Game starting in: ${data.time} seconds...`)
            setPlayerCount(data.counter)
        },
        postCountdown: (data) => {
            setTimer(`Game starting very soon: ${data.time} seconds...`)
        },
        grid: (data) => {
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
            setChat((prev) => [...prev, data.message])
        },
        counter: (data) => {
            console.log("Counter received:", data.counter);
            setPlayerCount(data.counter);
        },
    }
    if (currentMessageHandler) {
        ws.removeEventListener("message", currentMessageHandler);
    }
    currentMessageHandler = (e) => {
        const data = JSON.parse(e.data);
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
                Chat(chat, ws, start),
                {
                    tag: "div",
                    attrs: {
                        class: "counter-display",
                    },
                    children: [
                        {
                            tag: "div",
                            attrs: {
                                class: "counter-container",
                            },
                            children: [
                                {
                                    tag: "span",
                                    attrs: { class: "counter-icon" },
                                    children: [`👥 Players: ${String(playerCount)} / 4`],
                                }
                            ],
                        }
                    ]
                },
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