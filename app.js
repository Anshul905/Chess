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
    console.log('page load - ' , players);
    
    data = {  
        title : "My Chess Game",
    }
    res.render("index" , data);
});



io.on("connection" , (uniquesocket) => {
    console.log('connection 1 - ' , players);
    if( !players.white || !players.black )
        console.log("Player is connected");
    else
        console.log("Spectator is connected");


    // Assigning id to player and Broadcasts current player color 
    if( !players.white ){
        players.white =  uniquesocket.id ;
        uniquesocket.emit("playerRole","w");
    }else if( !players.black ){
        players.black =  uniquesocket.id ;
        uniquesocket.emit("playerRole","b");
    }else{
        uniquesocket.emit("spectatorRole");
    }

    console.log('connection 2 - ' , players);


    uniquesocket.on("disconnect" , () => {
        if( uniquesocket.id === players.white ){
            console.log("player with WHITE is disconnected");
            delete players.white ;
            console.log('disconnected - ',players);
        }else if( uniquesocket.id === players.black ){
            console.log("player with BLACK is disconnected");
            delete players.black ;
            // plus reset others board
            console.log('disconnected - ',players);
        }
    });

    uniquesocket.on("move",(curMove)=>{
        console.log('2. --------------- move logic ---------------');
                
        try {


            currentPlayer = chess.turn() ;
            console.log('3. currentPlayer' , currentPlayer);
            // console.log(uniquesocket.id);
            // console.log(players);
            
            
            if( currentPlayer==="w" && uniquesocket.id != players.white ) return ;
            if( currentPlayer==="b" && uniquesocket.id != players.black ) return ;

            console.log('4. Matching player');
            
            const result = chess.move(curMove); // this chess is different object , we are not moving 2 times
                            
            if(result){
                console.log("5. move is valid" , curMove);
                
                const isStalemate = chess.isStalemate();
                const isCheck = chess.isCheck();
                const isCheckmate = chess.isCheckmate();
                const status = isStalemate ? "Stalemate!" : isCheckmate ? 'Checkmate!' : isCheck ? 'Check!' : 'continues';
                                
                // Broadcasts ( the current move and updates the chessboard to its current board state ) to all connected clients
                io.emit("move" , curMove);
                io.emit("boardState" , chess.fen() ); 

                // Broadcasts the move information to all connected devices ( eg. frontend side )
                const data = { 
                    success: true, 
                    currentPlayer : currentPlayer,
                    gameStatus : status , 
                    move: curMove , 
                    result : result , 
                } ;

                io.emit('moveResult', data ); // Send success response
                console.log('8. sent move result');
            
                console.log('9. --------------- move logic end---------------');
            }else{
                //when this else executes 
                console.log("11. move is invalid" , curMove);
                io.emit('moveResult', { success: false, error: 'move is invalid' }); // Send failure response 
            } 
        }catch (error) {
            // console.log(error);
            console.log('12. ' , error.message);
            io.emit('moveResult', { success: false, error: error.message }); // Send failure response 
        }
    });

    

    uniquesocket.on('resetGame', () => {
        console.log('reset kardo');
        chess.reset();
        console.log(players);
        io.emit('resetGameConfirmed');
    });
    

    uniquesocket.on('newGameButton', () => {
        console.log('reset kardo');
        chess.reset();
        console.log(players);
        io.emit('newGameConfirmed');
    });



}) ;


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 