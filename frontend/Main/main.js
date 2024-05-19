window.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const decodedToken = parseJwt(token);
  const socket = io("https://groupchat-app-rtbo.onrender.com");

  socket.on("connect", () => {
    console.log("Connected to Socket.io server");
  });

  socket.on("newMessage", (message) => {
    console.log("New message received:", message);
    ShowMessages(message);
  });

  
  fetchUserGroups();

  
  axios
    .get("https://groupchat-app-rtbo.onrender.com/showMembers", {
      headers: { Authorisation: token },
    })
    .then((Response) => {
      console.log(Response);
      if (decodedToken.admin) {
        for (let i = 0; i < Response.data.peopeles.length; i++) {
          showMembers(Response.data.peopeles[i]);
        }
      }
    });

  const groupId = localStorage.getItem("Gid");
  if (groupId) {
    fetchGroupMessages(groupId);
  }

  const SendButton = document.getElementById("Send");
  SendButton.addEventListener("click", async () => {
    const messageContent = document
      .getElementById("messageContent")
      .value.trim();
    const fileInput = document.getElementById("fileInput").files[0];
    const groupId = localStorage.getItem("Gid");

    if (!messageContent && !fileInput) {
      alert("Please enter a message or select a file to send.");
      return;
    }

    const formData = new FormData();
    formData.append("message", messageContent);
    formData.append("groupId", groupId);
    if (fileInput) {
      formData.append("file", fileInput);
    }

    try {
      const response = await axios.post(
        "https://groupchat-app-rtbo.onrender.com/add-message",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorisation: token,
          },
        }
      );

      console.log(response);
      socket.emit("newMessage", response.data.response); 

      document.getElementById("messageContent").value = "";
      document.getElementById("fileInput").value = "";
    } catch (err) {
      console.log(err);
    }
  });

  function ShowMessages(message) {
    const MessageDiv = document.getElementById("message");
    const Li = document.createElement("li");
    Li.classList.add("mb-2"); 

    const messageContent = document.createElement("div");
    messageContent.textContent = `${message.User.name} : ${message.content}`;

    Li.appendChild(messageContent);

    if (message.fileUrl) {
      const fileExtension = message.fileUrl.split(".").pop().toLowerCase();

      if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
        const img = document.createElement("img");
        img.src = message.fileUrl;
        img.alt = message.content;
        img.width = 320; // Set width as required
        img.height = 240; // Set height as required
        img.classList.add("mt-2"); // Adding some margin-top for spacing
        Li.appendChild(img);
      } else if (["mp4", "webm"].includes(fileExtension)) {
        const video = document.createElement("video");
        video.width = 320; // Set width as required
        video.height = 240; // Set height as required
        video.controls = true;
        const source = document.createElement("source");
        source.src = message.fileUrl;
        source.type = `video/${fileExtension}`;
        video.appendChild(source);
        video.classList.add("mt-2"); // Adding some margin-top for spacing
        Li.appendChild(video);
      }
    }

    MessageDiv.appendChild(Li);
    MessageDiv.scrollTop = MessageDiv.scrollHeight; 
  }

  function fetchUserGroups() {
    axios
      .get("https://groupchat-app-rtbo.onrender.com/getGroupList", {
        headers: { Authorisation: token },
      })
      .then((response) => {
        const groups = response.data.name;
        const groupListElement = document.getElementById("groupList");
        groupListElement.innerHTML = ""; 

        groups.forEach((group) => {
          const li = document.createElement("li");
          const button = document.createElement("button");
          button.textContent = group.name;
          button.setAttribute("data-id", group.id);
          button.setAttribute("data-name", group.name);
          button.id = "groupListButton";
          li.appendChild(button);
          groupListElement.appendChild(li);
        });
      })
      .catch((err) => {
        console.log("Error fetching user groups:", err);
      });
  }

  function fetchGroupMessages(groupId) {
    axios
      .get(`https://groupchat-app-rtbo.onrender.com/get-message?groupId=${groupId}`, {
        headers: { Authorisation: token },
      })
      .then((response) => {
        const messages = response.data.messages;
        const MessageDiv = document.getElementById("message");
        MessageDiv.innerHTML = ""; 

        messages.forEach((message) => {
          ShowMessages(message);
        });
      })
      .catch((err) => {
        console.log("Error fetching group messages:", err);
      });
  }

  document.addEventListener("click", function (event) {
    const target = event.target;
    if (target.tagName === "BUTTON" && target.id === "groupListButton") {
      const id = target.getAttribute("data-id");
      const name = target.getAttribute("data-name");
      handleGrpNameClick(id, name);
    }
  });

  function showMembers(peeps) {
    const UserDiv = document.getElementById("user");
    const Child = document.createElement("span");
    Child.textContent = `${peeps.name}  `;
    Child.id = `${peeps.id}`;
    Child.name = `${peeps.name}`;
    const Btn1 = document.createElement("button");
    Btn1.textContent = "RemoveUser";
    Btn1.style.margin = "3px";
    Btn1.style.color = "Red";

    const Btn2 = document.createElement("button");
    Btn2.textContent = "MakeAdmin";
    Btn2.style.margin = "3px";
    Btn2.style.color = "Green";

    Child.appendChild(Btn1);
    Child.appendChild(Btn2);
    UserDiv.appendChild(Child);

    Btn1.addEventListener("click", function removeUser() {
      axios
        .delete(`https://groupchat-app-rtbo.onrender.com/RemoveMember/${Child.id}`)
        .then(() => {
          alert("User removed from group");
          location.reload();
        });
    });

    Btn2.addEventListener("click", function MakeAdmin() {
      axios
        .post(
          `https://groupchat-app-rtbo.onrender.com/MakeAdmin/${Child.id}/${Child.name}`,
          {
            status: true,
          },
          {
            headers: { Authorisation: token },
          }
        )
        .then(() => {
          alert("Admin made successfully");
          location.reload();
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  const CreateGroup = document.getElementById("CreateGroup");
  CreateGroup.addEventListener("click", function () {
    window.location.href = "../GroupEntryPoint/entry.html";
  });

  function ShowGroupName(Group) {
    const GName = document.getElementById("groupName");
    GName.textContent = `${Group}`;
    localStorage.setItem("GroupName", Group);
  }

  function handleGrpNameClick(id, groupName) {
    localStorage.setItem("Gid", id);
    ShowGroupName(groupName);
    fetchGroupMessages(id); 
  }

  const Invite = document.getElementById("InviteUser");
  Invite.addEventListener("click", function () {
    window.location.href = "../Invite/invite.html";
  });

  function parseJwt(token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }
});
