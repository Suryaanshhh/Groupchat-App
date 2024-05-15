

const create=document.getElementById("CreateGroup");
create.addEventListener("click",function(){
    const token=localStorage.getItem("token")
    const name=document.getElementById("groupName").value;
    const Group={
        name:name
    }
    axios.post('http://localhost:4000/createGroup',Group,{
        headers:{Authorisation :token}
    }).then((response)=>{
        console.log(response);
    }).catch(err=>{
        console.log(err)
    })
})