const socket = io();
const chess = new Chess();


// console.log(chess); //very important 

socket.on("playerRole" , function(role) { 
    const pieceColor = role==="w" ? "WHITE" : "BLACK" ;
    console.log(`You are assigned with ${pieceColor} pieces`); 
    playerRole = role ;
    renderBoard();
});
socket.on("spectatorRole" , function() { 
    console.log("You are a spectator");
    playerRole = null ;
    renderBoard();
});

