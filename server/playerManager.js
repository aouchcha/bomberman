//  Handles nickname validation, joining
export let playersUsernames = new Set();
export let setLength = { len: 0 };
import { waitingRoom } from "./index.js";
export function joining(req, res) {
    let body = [];
    let resu;
     req.on("data", (chunk) => {
        body.push(chunk);
    })

    req.on("end", () => {
        body = Buffer.concat(body).toString();
        resu = JSON.parse(body);

        playersUsernames.add(resu.username)

        if (waitingRoom.status == "postCountdown" || waitingRoom.status == "grid"){
             res.writeHead(401, { 'Content-Type': 'text/html' });
            res.end(JSON.stringify({ message: "The Game already started try later" }))
        }
        else if (playersUsernames.size == setLength.len) {
            res.writeHead(401, { 'Content-Type': 'text/html' });
            res.end(JSON.stringify({ message: "Invalid username" }))
        } else {
            setLength.len = playersUsernames.size;;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(JSON.stringify({ message: resu.username }));
        }
    })

    req.on("error", (err) => {
        console.error(err);
    });
}