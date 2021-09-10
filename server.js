const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
const fs = require("fs");

// setting view engine
app.set("view engine", "ejs");
// serving public file
app.use(express.static("public"));

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

// socket connection
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userData) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId, userData.username);

        // send msg
        socket.on("send-msg", (roomId, { userId: id, msg }) => {
            const data = JSON.parse(fs.readFileSync(`${__dirname}/data/meet-${roomId}.json`));

            if (data) {
                const user = data.find((obj) => obj.userId === id);
                const username = user["userData"].username;
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

        fs.readFile(`${__dirname}/data/meet-${roomId}.json`, (err, data) => {
            let meetServerData, meetClientData;
            if (err) {
                // admin user for meet
                meetServerData = [{ userId, role: "host", userData }];
                meetClientData = [{ userId, role: "host", name: userData["username"] }];

                // write data in server file
                fs.writeFile(`${__dirname}/data/meet-${roomId}.json`, JSON.stringify(meetServerData), (err) => {
                    if (err) {
                        console.log("Admin server", err);
                    }
                });
                // write data in client file
                fs.writeFile(`${__dirname}/public/data/meet-${roomId}.json`, JSON.stringify(meetClientData), (err) => {
                    if (err) {
                        console.log("Admin client", err);
                    }
                });
            } else {
                //  add new user to meet
                const serverObj = { userId, role: "participant", userData };
                meetServerData = JSON.parse(data);
                meetServerData.push(serverObj);

                const clientObj = { userId, role: "participant", name: userData["username"] };
                meetClientData = JSON.parse(fs.readFileSync(`${__dirname}/public/data/meet-${roomId}.json`));
                meetClientData.push(clientObj);

                // write data in server file
                fs.writeFile(`${__dirname}/data/meet-${roomId}.json`, JSON.stringify(meetServerData), (err) => {
                    if (err) {
                        console.log("User server", err);
                    }
                });
                // write data in client file
                fs.writeFile(`${__dirname}/public/data/meet-${roomId}.json`, JSON.stringify(meetClientData), (err) => {
                    if (err) {
                        console.log("User client", err);
                    }
                });
            }
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
