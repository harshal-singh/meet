const socket = io("/");
const videosGrid = document.getElementById("videos-grid");

// peer setting
const peers = {};
const peer = new Peer(undefined, {
    config: {
        iceServers: [
            { url: "stun:stun.l.google.com:19302" },
            { url: "stun:stun1.l.google.com:19302" },
            { url: "stun:stun2.l.google.com:19302" },
            { url: "stun:stun3.l.google.com:19302" },
            { url: "stun:stun4.l.google.com:19302" },
        ],
    },
});

// my video
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;
//  previewStreamVideo
const previewStreamVideo = document.getElementById("preview-stream");
previewStreamVideo.muted = true;

var getUserMedia =
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    }) ||
    navigator.mediaDevices.webkitGetUserMedia({
        video: true,
        audio: true,
    }) ||
    navigator.mediaDevices.mozGetUserMedia({
        video: true,
        audio: true,
    }) ||
    navigator.mediaDevices.msGetUserMedia({
        video: true,
        audio: true,
    }) ||
    navigator.mediaDevices.oGetUserMedia({
        video: true,
        audio: true,
    });
// getUserMedia
getUserMedia
    .then((myStream) => {
        myVideoStream = myStream;

        // preview stream
        previewStreamVideo.srcObject = myVideoStream;
        previewStreamVideo.play();

        // answering the call by user
        peer.on("call", (call) => {
            call.answer(myVideoStream);

            // add our video stream to user
            let calledOnce = false;
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                // read data from file
                const findUsername = fetch(`../data/meet-${ROOM_ID}.json`)
                    .then((data) => {
                        return data.json();
                    })
                    .then((arr) => {
                        const user = arr.find((obj) => obj.userId === call.peer);
                        return user["name"];
                    })
                    .catch((err) => {
                        console.warn(err);
                    });

                async function getUsername() {
                    const username = await findUsername;
                    // add video
                    addVideoStream(call.peer, username, video, userVideoStream);
                }
                if (!calledOnce) {
                    getUsername();
                    calledOnce = true;
                }
            });
        });

        //  on new user connected
        socket.on("user-connected", (userId, username) => {
            connectToNewUser(userId, username, myVideoStream);
        });

        //  on user disconnected
        socket.on("user-disconnected", (userId) => {
            if (peers[userId]) peers[userId].close();
            document.getElementById("div-" + userId).remove();
        });
    })
    .catch((err) => {
        alert(`To use please give access to your media devices:\n1) Camera\n2) Microphone \n\n${err}`);
    });

// on peer connected
peer.on("open", (autoPeerId) => {
    const overlay = document.getElementById("overlay");
    const btnJoinMeet = document.getElementById("join-meet");
    const usernameInput = document.getElementById("username");
    usernameInput.focus();

    // join meet
    btnJoinMeet.onclick = (e) => {
        e.preventDefault();

        const username = usernameInput.value;
        const userData = {
            username,
            vendor: navigator.vendor,
            platform: navigator.platform,
            language: navigator.language,
            userAgent: navigator.userAgent,
        };
        // check value
        if (username !== "") {
            usernameInput.style.borderColor = "#2f80ed";
            overlay.remove();
            localStorage.setItem("_user", autoPeerId);

            socket.emit("join-room", ROOM_ID, autoPeerId, userData);
            addVideoStream("myId", "You", myVideo, myVideoStream);

            if (window.innerWidth < 992) {
                document.querySelector("footer").style.display = "none";
                const myControls = document.querySelector(".my-controls");
                myControls.style.bottom = "36px";
                const btnMoreHTML = `<button id="more" class="material-icons">expand_more</button>`;
                myControls.insertAdjacentHTML("beforeend", btnMoreHTML);

                let optionsOff = true;
                const btnMore = document.getElementById("more");
                const options = document.getElementById("options");

                btnMore.onclick = () => {
                    if (optionsOff) {
                        btnMore.innerText = "expand_less";
                        options.style.right = "20px";
                        optionsOff = false;
                    } else {
                        btnMore.innerText = "expand_more";
                        options.style.right = "-80px";
                        optionsOff = true;
                    }
                };
                const closeChatArea = document.getElementById("close-chat-area");
                const closeParticipant = document.getElementById("close-participant");
                const chatArea = document.getElementById("chat-area");
                const participant = document.getElementById("participant");

                closeParticipant.onclick = () => {
                    participant.style.right = "-110vw";
                    participantOff = true;
                };

                closeChatArea.onclick = () => {
                    chatArea.style.right = "-110vw";
                    chatOff = true;
                };
            }
        } else {
            usernameInput.style.borderColor = "#eb5757";
        }
    };
});

//  add new video to room
function addVideoStream(userId, username, video, stream) {
    // video div
    const videoDiv = document.createElement("div");
    videoDiv.setAttribute("class", "video");
    videoDiv.setAttribute("id", "div-" + userId);
    // video element
    video.srcObject = stream;
    video.setAttribute("id", "video-" + userId);
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });

    // span element
    const span = document.createElement("span");
    span.setAttribute("class", "username");
    span.setAttribute("id", "username-" + userId);
    span.innerText = username;

    // add video, span to video div
    videoDiv.append(video);
    videoDiv.append(span);

    videosGrid.append(videoDiv);
}

// connect to new user
function connectToNewUser(userId, username, stream) {
    const call = peer.call(userId, stream);
    const userVideo = document.createElement("video");

    // add user video
    let calledOnce = false;
    call.on("stream", (userVideoStream) => {
        if (!calledOnce) {
            addVideoStream(userId, username, userVideo, userVideoStream);
            calledOnce = true;
        }
    });

    peers[userId] = call;
}

// mic - mute/unmute
function muteUnmute() {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

// video - show/hide
function playStop() {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}