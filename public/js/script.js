// control variable
let micOff = false;
let videocamOff = false;
let chatOff = true;
let participantOff = true;

// -------------------------------------------------------------------------------------------------------//
// index page --------------------------------------------------------------------------------------------//
// -------------------------------------------------------------------------------------------------------//
if (location.pathname == "/") {
  const error = document.getElementById("error");
  const btnJoin = document.getElementById("join");
  const btnNewMeet = document.getElementById("new-meet");
  const codeLinkInput = document.getElementById("code-link");
  codeLinkInput.focus();

  // new meet
  btnNewMeet.onclick = () => {
    window.location.href = "meet";
  };

  // meet code/link
  codeLinkInput.oninput = () => {
    if (codeLinkInput.value == "") {
      btnJoin.style.color = "#4f4f4f";
      btnJoin.style.cursor = "not-allowed";
      btnJoin.style.borderColor = "#4f4f4f";
      btnJoin.style.backgroundColor = "transparent";
      btnJoin.setAttribute("disabled", true);

      error.style.display = "none";
      codeLinkInput.style.borderColor = "#4f4f4f";
    } else {
      btnJoin.style.color = "#f2f2f2";
      btnJoin.style.cursor = "pointer";
      btnJoin.style.borderColor = "transparent";
      btnJoin.style.backgroundColor = "#4f4f4f";
      btnJoin.removeAttribute("disabled");
    }
  };

  // join meet
  btnJoin.onclick = () => {
    let code = codeLinkInput.value;
    if (code !== "") {
      if (isUrl(code)) {
        const url = new URL(code);
        code = url.pathname.split("/")[2];
      }

      // read data from file
      fetch(`/api/v1/user/${code}`)
        .then((data) => {
          return data.json();
        })
        .then(({ status, users }) => {
          error.style.display = "none";

          if (status === "success" && users.length !== 0) {
            codeLinkInput.value = "";
            window.location.href = `meet/${code}`;
          } else {
            error.style.display = "block";
            codeLinkInput.style.borderColor = "#eb5757";
          }
        })
        .catch((err) => {
          console.log(err);
          error.style.display = "block";
          codeLinkInput.style.borderColor = "#eb5757";
        });
    } else {
      codeLinkInput.style.borderColor = "#eb5757";
    }
  };

  const isUrl = (string) => {
    try {
      return Boolean(new URL(string));
    } catch (e) {
      return false;
    }
  };
}
// -------------------------------------------------------------------------------------------------------//
// meet page ---------------------------------------------------------------------------------------------//
// -------------------------------------------------------------------------------------------------------//
else {
  const btnMic = document.getElementById("mic");
  const btnCallEnd = document.getElementById("call_end");
  const btnVideoCam = document.getElementById("videocam");

  // mic control
  btnMic.onclick = (e) => {
    e.preventDefault();
    if (micOff) {
      btnMic.innerText = "mic";
      btnMic.classList.add("active");
      micOff = false;
    } else {
      btnMic.innerText = "mic_off";
      btnMic.classList.remove("active");
      micOff = true;
    }
    muteUnmute();
  };

  // video control
  btnVideoCam.onclick = (e) => {
    e.preventDefault();

    if (videocamOff) {
      btnVideoCam.innerText = "videocam";
      btnVideoCam.classList.add("active");
      videocamOff = false;
    } else {
      btnVideoCam.innerText = "videocam_off";
      btnVideoCam.classList.remove("active");
      videocamOff = true;
    }
    playStop();
  };

  // call end
  btnCallEnd.onclick = (e) => {
    e.preventDefault();
    window.location.href = "/";
  };

  // ---------- other options ---------- //
  const popupMsg = document.getElementById("popup-msg");
  const popupLayer = document.getElementById("popup-layer");

  const buttons = [
    { id: "code", msg: "Meet code copied!", copy: ROOM_ID },
    { id: "link", msg: "Meet link copied!", copy: window.location.href },
    { id: "people" },
    { id: "chat_bubble" },
  ];

  buttons.forEach((obj) => {
    const button = document.getElementById(obj.id);
    button.onmouseenter = () => {
      popupMsg.innerHTML = button.classList.add("tooltip");
    };
    button.onmouseleave = () => {
      button.classList.remove("tooltip");
    };

    if (obj?.msg) {
      // show popup
      button.onclick = () => {
        navigator.clipboard.writeText(obj.copy);
        popupLayer.style.display = "grid";
        popupMsg.innerHTML = obj.msg;
        // close popup
        setTimeout(() => {
          popupLayer.style.display = "none";
        }, 1000);
      };
    }
  });

  // meet / chat
  const btnPeople = document.getElementById("people");
  const btnChat = document.getElementById("chat_bubble");
  const btnSendMsg = document.getElementById("send-msg");
  const chats = document.getElementById("chats");
  const chatArea = document.getElementById("chat-area");
  const chatMsgInput = document.getElementById("chat-msg");
  const participant = document.getElementById("participant");
  const participantList = document.getElementById("participant-list");

  // meet participant
  btnPeople.onclick = () => {
    participantList.innerHTML = "";
    if (participantOff) {
      btnPeople.classList.remove("new");
      participantList.textContent = "Loading participants...";
      // get all user
      fetch(`/api/v1/user/${ROOM_ID}`)
        .then((data) => {
          return data.json();
        })
        .then(({ users }) => {
          participantList.textContent = "";
          users.forEach((user) => {
            const html = `<p>${user["name"]}</p>`;
            participantList.insertAdjacentHTML("beforeend", html);
          });
        })
        .catch((err) => {
          console.log(err);
        });

      participant.style.right = window.innerWidth < 922 ? "0" : "125px";
      participantOff = false;
      // chat area
      if (!chatOff) {
        chatArea.style.right = window.innerWidth < 922 ? "-110vw" : "-345px";
        chatOff = true;
      }
    } else {
      participant.style.right = window.innerWidth < 922 ? "-110vw" : "-345px";
      participantOff = true;
    }
  };

  // chat participant
  btnChat.onclick = () => {
    if (chatOff) {
      btnChat.classList.remove("new");
      chatMsgInput.focus();
      chatArea.style.right = window.innerWidth < 922 ? "0" : "125px";
      chatOff = false;
      // participant
      if (!participantOff) {
        participant.style.right = window.innerWidth < 922 ? "-110vw" : "-345px";
        participantOff = true;
      }
      document.removeEventListener("keydown", addKeyDownEvent);
    } else {
      chatArea.style.right = window.innerWidth < 922 ? "-110vw" : "-345px";
      chatOff = true;
      document.addEventListener("keydown", addKeyDownEvent);
    }
  };

  // send msg
  btnSendMsg.onclick = (e) => {
    e.preventDefault();
    const msg = chatMsgInput.value;
    if (msg !== "") {
      const userId = localStorage.getItem("_user");
      const data = { userId, msg };
      // send to all
      socket.emit("send-msg", ROOM_ID, data);
      // reset input
      chatMsgInput.style.borderColor = "#4f4f4f";
      chatMsgInput.value = "";
      // our end
      const ourMsgHTML = `<div class="outgoing">
                                    <small>You</small>
                                    <p>${msg}</p>
                                </div>`;
      chats.insertAdjacentHTML("beforeend", ourMsgHTML);
      scrollToBottom();
    } else {
      chatMsgInput.style.borderColor = "#eb5757";
    }
  };

  socket.on("receive-msg", ({ status, username, msg }) => {
    let msgHTML;
    if (status === "success") {
      msgHTML = `<div class="incoming">
                            <small>${username}</small>
                            <p>${msg}</p>
                        </div>`;
    } else if (status === "fail") {
      msgHTML = `<div class="incoming-error">
                            <small>from ${username}</small>
                            <p>${msg}</p>
                        </div>`;
    }
    chats.insertAdjacentHTML("beforeend", msgHTML);
    if (chatOff) {
      btnChat.classList.add("new");
    }
    scrollToBottom();

    if (window.innerWidth < 992) {
      const btnMore = document.getElementById("more");
      if (optionsOff) {
        btnMore.classList.add("new");
      }
    }
  });

  const scrollToBottom = () => {
    chats.scrollTop = chats.scrollHeight;
  };

  if (window.innerWidth < 922) {
    const closeParticipant = `<button id="close-participant" class="material-icons">close</button>`;
    participant.insertAdjacentHTML("beforeend", closeParticipant);

    const closeChatArea = `<button id="close-chat-area" class="material-icons">close</button>`;
    chatArea.insertAdjacentHTML("beforeend", closeChatArea);
  }

  // document.querySelector("footer").style.display = "none";

  // prevent from back click in browser
  history.pushState(null, null, location.href);
  window.onpopstate = function () {
    history.go(1);
  };
}
