const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    peerId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    roomId: {
        type: String,
        required: true,
    },
});

// using th schema
const Users = mongoose.model("Users", usersSchema);

module.exports = Users;
