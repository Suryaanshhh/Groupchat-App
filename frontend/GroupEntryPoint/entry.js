const create = document.getElementById("CreateGroup");
create.addEventListener("click", function () {
  const token = localStorage.getItem("token");
  const name = document.getElementById("groupName").value;
  const Group = {
    name: name,
  };
  axios
    .post("https://groupchat-app-rtbo.onrender.com/createGroup", Group, {
      headers: { Authorisation: token },
    })
    .then((response) => {
      console.log(response);
      localStorage.setItem("token",response.data.token)
      window.location.href = "../Main/main.html";
    })
    .catch((err) => {
      console.log(err);
    });
});
