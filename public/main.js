// Frontend controller: HTTP + WS logic
import { useState } from "./Apex/core.js";
import { waitingRoom } from "./render.js";

let ws

export function renderApp() {
    const [username, setUsername] = useState("")
    const [wait, setWait] = useState(true)

    async function checkUserName(e) {
        if (username.trim().length == 0 || username.trim().length > 6) return
        if (e.key == 'Enter') {
            if (localStorage.getItem("player") != undefined) {
                console.log("already there is a player");
                return
            }
            const response = await fetch("/join", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                })
            })

            const result = await response.json();
            if (response.ok) {
                localStorage.setItem("player", username)
                ws = new WebSocket(`ws://10.1.2.6:8080?username=${result.message}`);
                ws.onopen = () => {
                    console.log("were connected");
                };
                ws.onclose = () => (
                    console.log("ws close"),
                    localStorage.removeItem("player")
                )
                setWait(false);
            } else {
                console.log(result.message);
                console.log('An error occurred while connecting.');
            }

        }
    }

    window.onbeforeunload = () => {
        console.log('Page is unloading')
        localStorage.removeItem('player')
    }

    return (
        wait ? {
            tag: "div",
            attrs: {
                class: 'username-container'
            },
            children: [
                {
                    tag: "h2",
                    children: ["Welcome, please enter a username less than 7 letters.."],
                },
                {
                    tag: "input",
                    attrs: {
                        type: "text",
                        name: "username",
                        value: username,
                        placeholder: "Enter username...",
                        autofocus: 'autofocus',
                        oninput: (e) => {
                            setUsername(e.target.value)
                        },
                        onkeydown: async (e) => await checkUserName(e)
                    }
                }
            ]
        } : waitingRoom(ws, setWait)
    )
}
