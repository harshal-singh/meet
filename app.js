const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const meetRoutes = require("./routers/meetRoutes");
const userRoutes = require("./routers/userRoutes");
const {
  getUser,
  addUser,
  deleteUser,
} = require("./controllers/userController");
const path = require("path");

// setting view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// serving public file
app.use(express.static("public"));
app.use(express.static("data"));

// home page
app.get("/", (req, res) => {
  res.render("index");
});

// meet routers
app.use("/meet", meetRoutes);
app.use("/api/v1/user", userRoutes);

// socket connection
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, username) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId, username);

    // add user to mongoDB
    const userDetails = { peerId: userId, name: username, roomId };
    addUser(userDetails).catch((err) => {
      console.log("Server addUser:", err);
    });

    // send msg
    socket.on("send-msg", (roomId, { userId, msg }) => {
      // get user from mongoDB
      getUser(userId, roomId)
        .then((user) => {
          const username = user[0].name;
          socket
            .to(roomId)
            .emit("receive-msg", { status: "success", username, msg });
        })
        .catch((err) => {
          console.log("Server getUser:", err);
        });
    });

    // user disconnect
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
      deleteUser(roomId, userId);
    });
  });
});

module.exports = server;
