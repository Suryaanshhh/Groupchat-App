const SendButton = document.getElementById("Send");

window.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  setInterval(() => {
    let flag = true;
    axios
      .get("http://localhost:4000/get-message", {
        headers: {
          Authorisation: token,
        },
      })
      .then((response) => {
        if (flag) {
          axios
            .get("http://localhost:4000/getGroupList", {
              headers: {
                Authorisation: token,
              },
            })
            .then((response2) => {
              console.log(response2);
              const Grouplist = document.getElementById("groupList");
              const GroupDiv = document.createElement("div");
              const SwitchBtn = document.createElement("button");
              SwitchBtn.textContent = "Go";
              GroupDiv.innerHTML = "";
              
              for (var l = 0; l < response2.data.name.length; l++) {
                const listItem = document.createElement("li");
                listItem.textContent = response2.data.name[l].name;
                GroupDiv.appendChild(listItem);
              }
              
              // Append the button after the list items
              GroupDiv.appendChild(SwitchBtn);
              
              // Check if the contents are different before appending
              if (Grouplist.innerHTML !== GroupDiv.innerHTML) {
                console.log(Grouplist.childNodes);
                console.log(GroupDiv);
                Grouplist.appendChild(GroupDiv);
              }
              
            });
        } else {
          flag = false;
        }
        ShowGroupName(response.data.messages[0].Group.name);
        let MessageArr1 = new Array();
        let MessageArr2 = new Array();
        const MessageDiv = document.getElementById("message");
        MessageDiv.textContent = "";
        for (var i = 0; i < response.data.messages.length; i++) {
          console.log(response.data.messages[i]);
          MessageArr1.push(response.data.messages[i]);
          console.log(
            response.data.messages[response.data.messages.length - 1].id
          );
          const IdApi = `http://localhost:4000/get-message?messageId=${
            response.data.messages[response.data.messages.length - 1].id
          }`;
          axios
            .get(IdApi, {
              headers: {
                Authorisation: token,
              },
            })
            .then((res2) => {
              console.log(res2);
            })
            .catch((err) => [console.log(err)]);
          //ShowMessages(response.data.messages[i]);
        }
        console.log(MessageArr1.length);

        for (var k = 0; k < MessageArr1.length; k++) {
          if (MessageArr1.length > 10) {
            MessageArr1.shift(i);
          }
          continue;
        }
        console.log(MessageArr1.length);
        let string = JSON.stringify(MessageArr1);
        localStorage.setItem("Messages", string);

        //console.log(MessageArr);
        const text = localStorage.getItem("Messages");
        if (text) {
          let strText = JSON.parse(text);
          for (var j = 0; j < text.length; j++) {
            ShowMessages(strText[j]);
          }
        } else {
          const MessageDiv = document.getElementById("message");
          MessageDiv.innerHTML = "<h2> Start Chatting </h2>";
        }

        //console.log(strText);
      })
      .catch((err) => {
        console.log(err);
      });
  }, 1000);
});

SendButton.addEventListener("click", function () {
  const token = localStorage.getItem("token");
  const MessageContent = document.getElementById("messageContent").value;
  const Text = {
    Message: MessageContent,
  };
  axios
    .post("http://localhost:4000/add-message", Text, {
      headers: { Authorisation: token },
    })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
});

function ShowMessages(message) {
  const MessageDiv = document.getElementById("message");
  const Li = document.createElement("li");
  Li.textContent = `${message.User.name} : ${message.content}`;
  MessageDiv.appendChild(Li);
}
const CreateGroup = document.getElementById("CreateGroup");

CreateGroup.addEventListener("click", function () {
  window.location.href = "../GroupEntryPoint/entry.html";
});

function ShowGroupName(Group) {
  const GName = document.getElementById("groupName");
  GName.textContent = `${Group}`;
}
