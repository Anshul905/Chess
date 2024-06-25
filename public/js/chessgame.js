const socket = io();

socket.emit("churan")
socket.on("churan paapdi" , ()=> {
    console.log("churan paapdi received");
})