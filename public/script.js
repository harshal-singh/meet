const socket = io("/");
const videoGird = document.getElementById("video-grid");

// list of stun server
const peer = new Peer(undefined, {
    urls: [
        "stun.l.google.com:19302",
        "stun1.l.google.com:19302",
        "stun2.l.google.com:19302",
        "stun3.l.google.com:19302",
        "stun4.l.google.com:19302",
    ],
});

// our stream
const peers = {};
const myVideo = document.createElement("video");
myVideo.muted = true;

// ask permission for camera and microphone
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        addVideoStream(myVideo, stream);

        // answer a call
        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            connectToNewUser(userId, stream);
        });
    })
    .catch((err) => {
        alert(`To use please give access to your media devices:\n1) Camera\n2) Microphone \n\n${err}`);
    });

// add user
peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
});

// remove user
socket.on("user-disconnected", (userId) => {
    if (peers[userId]) peers[userId].close();
});

// add new video stream
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    // show video on UI
    videoGird.append(video);
}

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    // on connection
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
    // on close
    call.on("close", () => {
        video.remove();
    });

    peers[userId] = call;
}
