const express = require("express");
const { v4: uuidV4 } = require("uuid");

const router = express.Router();

// meet page
router.route("/").get((req, res) => {
    res.redirect(`/meet/${uuidV4()}`);
});

// meet room page
router.route("/:room").get((req, res) => {
    if (req.params.room.length == 36) {
        res.render("meet", { roomId: req.params.room });
    } else {
        res.redirect("/");
    }
});

module.exports = router;
