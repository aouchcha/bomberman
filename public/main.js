// Frontend controller: HTTP + WS logic
import { useState } from "./Apex/core.js";
import { waitingRoom } from "./render.js";

let ws

export function renderApp() {
    const [username, setUsername] = useState("")
    const [wait, setWait] = useState(true)
    const [nbr, setNbr] = useState(0);


    async function checkUserName(e) {
        if (e.key == 'Enter') {
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
                ws = new WebSocket(`ws://localhost:8080?username=${result.message}`);
                ws.onopen = () => {
                    console.log("were connected");
                };
                ws.onclose = () => (
                    console.log("ws close"),
                    localStorage.removeItem("player"),
                    setTimeout(() => {
                        window.location.reload()
                    }, 5000)
                )
                setWait(false);
            } else {
                console.log(result.message);
                console.log('An error occurred while connecting.');
            }

        }
    }

    return (
        wait ? {
            tag: "input",
            attrs: {
                type: "text",
                value: username,
                placeholder: "Enter username",
                autofocus: 'autofocus',
                // style: wait ? "display:flex" : "display:none",
                oninput: (e) => {
                    setUsername(e.target.value)
                },
                onkeydown: async (e) => await checkUserName(e)
            }
        } : waitingRoom(ws)
    )
}
