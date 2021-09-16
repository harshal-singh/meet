const Users = require("../models/userModels");

// get all user
exports.getAllUser = async (meetId) => {
    try {
        return await Users.find({ roomId: meetId });
    } catch (err) {
        console.log("Controller getAllUser:", err);
    }
};

// get user
exports.getUser = async (userId, meetId) => {
    try {
        return await Users.find({ peerId: userId, roomId: meetId });
    } catch (err) {
        console.log("Controller getUser:", err);
    }
};

// add user
exports.addUser = async (userDetails) => {
    try {
        await Users.create({ ...userDetails });
    } catch (err) {
        console.log("Controller addUser:", err);
    }
};

// delete user
exports.deleteUser = async (meetId, userId) => {
    try {
        await Users.deleteOne({ roomId: meetId, peerId: userId });
    } catch (err) {
        console.log("Controller deleteUser:", err);
    }
};
