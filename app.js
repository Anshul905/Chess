const express = require("express")
const socket = require("socket.io")
const http = require("http")
const { Chess } = require("chess.js")
const path = require("path")
const { title } = require("process")

const app = express() ;
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess() ;
let players = {} ;
let currentPlayer = "w" ;

app.set("view engine","ejs") ;
app.use(express.static(path.join(__dirname,"public"))) ;

app.get("/",(req,res) => {
    res.render("index" , { title : "My Chess Game" });
});



io.on("connection" , (uniquesocket) => {
    if( !players.white || !players.black )
        console.log("Player is connected");
    else
        console.log("Spectator is connected");

    if( !players.white ){
        players.white =  uniquesocket.id ;
        uniquesocket.emit("playerRole","w");
    }else if( !players.black ){
        players.black =  uniquesocket.id ;
        uniquesocket.emit("playerRole","b");
    }else{
        uniquesocket.emit("spectatorRole");
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

    uniquesocket.on("move",(curMove)=>{

        try {
            currentPlayer = chess.turn() ;
            console.log(currentPlayer);
            if( currentPlayer==="w" && uniquesocket.id != players.white ) return ;
            if( currentPlayer==="b" && uniquesocket.id != players.black ) return ;
            
            const result = chess.move(curMove);
            console.log(result);
            
            if(result){
                console.log("move is valid" , curMove);
                io.emit("move" , curMove);
                io.emit("boardState" , chess.fen() ); 
            }else{
                console.log("move is invalid" , curMove);
                uniquesocket.emit("invalidMove",curMove);
            }
        } catch (error) {
            console.log("Somewent went wrong -> error : " , error);
            uniquesocket.emit("Invalid move",curMove);
        }
    });

    

}) ;


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 