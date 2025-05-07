import { useState } from "./Apex/core.js";

export function Chat(chat, ws, start) {
    const [msg, setMsg] = useState("");
    function sendMessage() {
        if (msg && msg.trim() != "") {
            ws.send(JSON.stringify({
                type: 'chat',
                message: msg,
            }));
            setMsg("");
        }
    }
    return (
        {
            tag: "div",
            attrs: {
                class: "chat-container",
                style: start ? "display:none;" : "display:flex;"
            },
            children: [
                {
                    tag: "div",
                    attrs: {
                        class: "chat-Header",
                    },
                    children: [`Game Chat`]
                },
                {
                    tag: "div",
                    attrs: {
                        class: "message-Container"
                    },
                    children: chat && chat.length > 0 ? chat.map((message, index) => ({
                        tag: "div",
                        attrs: {
                            className: "message-element",
                            key: index
                        },
                        children: [message]
                    })) : []
                },
                {
                    tag: "div",
                    attrs: {
                        class: "input-Container"
                    },
                    children: [
                        {
                            tag: "input",
                            attrs: {
                                type: "text",
                                class: "message-Input",
                                palceholder: "Type your message...",
                                value: msg,
                                oninput: (e) => setMsg(e.target.value),
                            },
                        }, {
                            tag: "button",
                            attrs: {
                                class: "send-Button",
                                onmouseover: (e) => {
                                    e.target.style.background = '#45a049';
                                    e.target.style.transform = 'scale(1.05)';
                                },
                                onmouseout: (e) => {
                                    e.target.style.background = '#4CAF50';
                                    e.target.style.transform = 'scale(1)';
                                },
                                onclick: sendMessage
                            },
                            children: ["SEND"]
                        }
                    ]
                }
            ]
        }
    );
}


