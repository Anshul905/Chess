const express = require("express")
const socket = require("socket.io")
const http = require("http")
const { Chess, BLACK } = require("chess.js")
const path = require("path")
const { title } = require("process")

const app = express() ;
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess() ;
let players = {} ;
let currentPlayer = "W" ;

app.set("view engine","ejs") ;
app.use(express.static(path.join(__dirname,"public"))) ;

app.get("/",(req,res) => {
    res.render("index" , { title : "Chess Game" });
});



io.on("connection" , (uniquesocket) => {
    if( !players.white || !players.black )
        console.log("Player is connected");
    else
        console.log("Spectator is connected");

    if( !players.white ){
        players.white =  uniquesocket.id ;
        uniquesocket.emit("w");
    }else if( !players.black ){
        players.black =  uniquesocket.id ;
        uniquesocket.emit("b");
    }else{
        uniquesocket.emit("s");
    }

    uniquesocket.on("disconnect" , () => {

        // if( uniquesocket.id === players.white || uniquesocket.id === players.black){
        //     if( uniquesocket.id === players.white ){
        //         console.log("player with WHITE is disconnected");
        //         console.log("BLACK wins");
        //     }else if( uniquesocket.id === players.black ){
        //         console.log("player with BLACK is disconnected");
        //         console.log("WHITE wins");
        //     }    
        //     delete players.white ;
        //     delete players.black ;
        //     console.log("GAME END");
        // }else{
        //     console.log("Spectator is disconnected");
        // }

        if( uniquesocket.id === players.white ){
            console.log("player with WHITE is disconnected");
            delete players.white ;
        }else if( uniquesocket.id === players.black ){
            console.log("player with BLACK is disconnected");
            delete players.black ;
        }
        
    });

}) ;


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 