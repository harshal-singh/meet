const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
const fs = require("fs");
const { rejects } = require("assert");
const { resolve } = require("path");
const { json } = require("express");

// setting view engine
app.set("view engine", "ejs");
// serving public file
app.use(express.static("public"));
app.use(express.static("data"));

// home page
app.get("/", (req, res) => {
    res.render("index");
});

// meet page
app.get("/meet", (req, res) => {
    res.redirect(`/meet/${uuidV4()}`);
});

// meet page
app.get("/meet/:room", (req, res) => {
    res.render("meet", { roomId: req.params.room });
});

// read file
const readFilePro = (file) => {
    return new Promise((resolve, rejects) => {
        fs.readFile(file, (err, data) => {
            let status, obj;
            if (err) {
                status = "fail";
                obj = err;
            } else {
                status = "success";
                obj = JSON.parse(data);
            }
            resolve({ status, obj });
        });
    });
};

// write file
const writeFilePro = (file, data) => {
    return new Promise((resolve, rejects) => {
        fs.writeFile(file, JSON.stringify(data), (err) => {
            if (err) {
                rejects(err);
            } else {
                resolve();
            }
        });
    });
};

// socket connection
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, username) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId, username);

        // send msg
        socket.on("send-msg", (roomId, { userId: id, msg }) => {
            const data = JSON.parse(fs.readFileSync(`${__dirname}/data/meet-${roomId}.json`));

            if (data) {
                const user = data.find((obj) => obj.userId === id);
                const username = user["username"];
                socket.to(roomId).emit("receive-msg", { status: "success", username, msg });
            } else {
                socket.to(roomId).emit("receive-msg", {
                    status: "fail",
                    username: "server",
                    msg: "Some message is not received",
                });
            }
        });

        // user disconnect
        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });

        let meetServerData;
        readFilePro(`${__dirname}/data/meet-${roomId}.json`)
            .then(({ status, obj }) => {
                if (status === "success") {
                    //  add new user to meet
                    const serverObj = { userId, role: "participant", username };
                    meetServerData = obj;
                    meetServerData.push(serverObj);
                } else if (status === "fail") {
                    // admin user for meet
                    meetServerData = [{ userId, role: "host", username }];
                }
                return meetServerData;
            })
            .then((meetServerData) => {
                writeFilePro(`${__dirname}/data/meet-${roomId}.json`, meetServerData);
            })
            .catch((err) => {
                console.log(err);
            });
    });
});

const PORT = process.env.PORT || 8000;
// listen on port
server.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Listening on port ${PORT}...`);
    }
});
