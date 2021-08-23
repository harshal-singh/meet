const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

// home rout
app.get("/", (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

// meeting room
app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});

// on room connection
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);
        // user disconnected
        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    });
});

// server
const PORT = process.env.PORT || 8000;
server.listen(PORT, (err) => {
    if (err) console.log(`ERROR: ${err}`);
    else console.log(`Listening on port ${PORT}...`);
});
