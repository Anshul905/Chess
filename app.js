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
    data = {  
        title : "My Chess Game",
    }
    res.render("index" , data);
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
            console.log('currentPlayer' , currentPlayer);
            if( currentPlayer==="w" && uniquesocket.id != players.white ) return ;
            if( currentPlayer==="b" && uniquesocket.id != players.black ) return ;
            
            const result = chess.move(curMove);          
            
            if(result){
                console.log("move is valid" , curMove);
                
                const isCheck = chess.isCheck();
                const isCheckmate = chess.isCheckmate();
                const status = isCheckmate ? 'Checkmate!' : isCheck ? 'Check!' : 'continues';
                
                io.emit("move" , curMove);
                io.emit("boardState" , chess.fen() ); 

                const data = { 
                    success: true, 
                    currentPlayer : currentPlayer,
                    gameStatus : status , 
                    move: curMove , 
                    result : result , 
                } ;

                io.emit('moveResult', data ); // Send success response
                console.log('sent move result to frontend');
            
            }else{
                console.log("move is invalid" , curMove);
                io.emit('moveResult', { success: false, error: 'move is invalid' }); // Send failure response 
            } 
        }catch (error) {
            console.log(error);
            io.emit('moveResult', { success: false, error: error.message }); // Send failure response 
        }
    });

    

}) ;


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 