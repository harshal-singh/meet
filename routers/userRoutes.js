const express = require("express");
const { getUser, getAllUser } = require("../controllers/userController");

const router = express.Router();

// get all users
router.route("/:room").get((req, res) => {
    const roomId = req.params.room;
    getAllUser(roomId)
        .then((users) => {
            res.status(200).json({
                status: "success",
                users: users,
            });
        })
        .catch((err) => {
            res.status(404).json({
                status: "fail",
                message: err,
            });
        });
});

// get user
router.route("/:room/:id").get((req, res) => {
    const userId = req.params.id;
    const roomId = req.params.room;
    getUser(userId, roomId)
        .then((user) => {
            const username = user[0].name;
            res.status(200).json({
                status: "success",
                name: username,
            });
        })
        .catch((err) => {
            res.status(404).json({
                status: "fail",
                message: err,
            });
        });
});

module.exports = router;
