const socket = io();

socket.on("w" , ()=> {
    console.log("You are assigned with WHITE pieces");
})
socket.on("b" , ()=> {
    console.log("You are assigned with BLACK pieces");
})
socket.on("s" , ()=> {
    console.log("You are a spectator");
})





