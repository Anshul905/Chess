const socket = io();
const chess = new Chess();
// console.log(chess); //very important 
const boardElement = document.querySelector(".chessboard");


let draggedPiece = null ;
let sourceSquare = null ;
let playerRole = null ;

const renderBoard = () => {
    const board = chess.board()
    boardElement.innerHTML = "" ;
    // console.log(board);
    // return ;
    board.forEach( (row , rowIndex) => {
        row.forEach( (square , colIndex ) => {

            // sqEle
            const sqEle = document.createElement("div");
            sqEle.classList.add(
                "square" , 
                ( rowIndex + colIndex ) % 2 === 0 ? "light" : "dark"
            );
            sqEle.dataset.row = rowIndex ;
            sqEle.dataset.col = colIndex ;
            
            if(square){
                const pieceEle = document.createElement("div");
                pieceEle.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black" 
                )
                pieceEle.innerText = getPieceUnicode(square) ;
                pieceEle.draggable = playerRole === square.color ;

                pieceEle.addEventListener("dragstart", (e) => {
                    if(pieceEle.draggable){
                        draggedPiece = pieceEle ;
                        sourceSquare = { row : rowIndex , col : colIndex };
                        e.dataTransfer.setData("text/plain","");
                    }
                });

                pieceEle.addEventListener("dragend", () => {
                    draggedPiece = null ;
                    sourceSquare = null ;
                });

                sqEle.appendChild(pieceEle);
            }

            sqEle.addEventListener("dragover",(e)=>{
                e.preventDefault();
            })
            sqEle.addEventListener("drop",(e)=>{
                e.preventDefault();
                if( draggedPiece ){
                    const  targetSquare = {
                        row : parseInt(sqEle.dataset.row) ,
                        col : parseInt(sqEle.dataset.col) 
                    };
                    handleMove(sourceSquare,targetSquare);
                }
            })
            boardElement.append(sqEle);

        });     
    });

    if( playerRole == 'b' ) boardElement.classList.add("flipped")
    else boardElement.classList.remove("flipped") ;

}


const handleMove = (source,target) => {    
    const move = {
        from : `${String.fromCharCode(97+source.col)}${8-source.row}` , 
        to   : `${String.fromCharCode(97+target.col)}${8-target.row}` , 
        promotion : 'q'
    }
    socket.emit("move",move);    
}

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p : "♙",
        r : "♖",
        n : "♘",
        b : "♗",
        q : "♕",
        k : "♔",
        P : "♟",
        R : "♜",
        N : "♞",
        B : "♝",
        Q : "♛",
        K : "♚",
    }
    return unicodePieces[piece.type] || "" ;
}



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
socket.on("boardState" , function(fen) { 
    chess.load(fen);
    renderBoard();
});
socket.on("move" , function(curMove) { 
    chess.move(curMove);
    renderBoard();
});



const piecesName = {
    p: 'Pawn',
    r: 'Rook',
    n: 'Knight',
    b: 'Bishop',
    q: 'Queen',
    k: 'King',
    P: 'Pawn',
    R: 'Rook',
    N: 'Knight',
    B: 'Bishop',
    Q: 'Queen',
    K: 'King',
};

const cp = document.querySelector("#currentPlayer");
const gs = document.querySelector("#gameStatus");
const gr = document.querySelector("#gameResult");
const p = document.querySelector("#pieceDetail");


socket.on("moveResult", function (data) {

    try {        
        if (data.success) {
            console.log("Move successful:", data);
    
            const nextPlayer = data.currentPlayer == "w" ? "BLACK" : "WHITE" 
            const currentPlayer = data.currentPlayer == "w" ? "WHITE" : "BLACK"
    
            //who to move next
            cp.innerHTML = nextPlayer + " to play now"
    
            //game status
            gs.innerHTML = "Game Status : " + data.gameStatus
    
            //game result
            if( data.gameStatus=="Checkmate!" ){
                gr.innerHTML =  "Game Result : " + currentPlayer + " Wins"
                cp.innerHTML = "Game Ends"
            }
            if( data.gameStatus=="Stalemate!" ){
                gr.innerHTML =  "Game Result : Draw"
                cp.innerHTML = "Game Ends"
            }
    
            //last move detail
            p.innerHTML =  "Opponent's Late Move : " + piecesName[data.result.piece];
            p.innerHTML += " ( " + data.result.from + " to " + data.result.to + " )";
            
    
        } else {
            console.log(data.error);
        }
    } catch (error) {
        console.log(error);
    }

});


renderBoard();




