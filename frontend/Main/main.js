const SendButton = document.getElementById("Send");

window.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  setInterval(() => {
    axios
      .get("http://localhost:4000/get-message", {
        headers: {
          Authorisation: token,
        },
      })
      .then((response) => {
        let MessageArr1 = new Array();
        let MessageArr2 = new Array();
        const MessageDiv = document.getElementById("message");
        MessageDiv.textContent = "";
        for (var i = 0; i < response.data.messages.length; i++) {
          //console.log(response.data.messages[i])
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
              //console.log(res2);
            })
            .catch((err) => [console.log(err)]);
          //ShowMessages(response.data.messages[i]);
        }
       console.log(MessageArr1.length);

       for(var k=0;k<MessageArr1.length;k++){
        if(MessageArr1.length>10){
          MessageArr1.shift(i)
        }
       continue;
       }
       console.log(MessageArr1.length);
        let string = JSON.stringify(MessageArr1);
        localStorage.setItem("Messages", string);
       
        //console.log(MessageArr);
        const text = localStorage.getItem("Messages");
        let strText = JSON.parse(text);
        
        //console.log(strText);
        for (var j = 0; j < text.length; j++) {
          ShowMessages(strText[j]);
        }
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
  Li.textContent = `${message.content}`;
  MessageDiv.appendChild(Li);
}
