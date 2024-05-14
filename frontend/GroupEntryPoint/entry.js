const { response } = require("express");

const create=document.getElementById("CreateGroup");
create.addEventListener("click",function(){
    const token=localStorage.getItem("token")
    const GroupName=document.getElementById("groupName").value;
    axios.post('/http://localhost:4000/createGroup',GroupName,{
        headers:{Authorisation :token}
    }).then((response)=>{
        console.log(response);
    })
})