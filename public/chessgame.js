const socket = io();
const chess = new Chess();
// console.log(chess); //very important 
const boardElement = document.querySelector(".chessboard");


let draggedPiece = null ;
let sourceSquare = null ;
let playerRole = null ;




const renderBoard = () => {

    console.log('rendering board..... ');

    
    const board = chess.board()
    boardElement.innerHTML = "" ;
    // console.log(board);
    // return ;
    
    board.forEach( (row , rowIndex) => {
        row.forEach( (square , colIndex ) => {
            // console.log(square);
            
            // sqEle
            const sqEle = document.createElement("div");
            sqEle.classList.add( "square" , ( rowIndex + colIndex ) % 2 === 0 ? "light" : "dark" );
            sqEle.dataset.row = rowIndex ;
            sqEle.dataset.col = colIndex ;
            
            
            if(square){
                // piece is present in the square - creating piece and making it draggable
                
                const pieceEle = document.createElement("div");
                pieceEle.classList.add("piece",square.color === "w" ? "white" : "black" )
                pieceEle.innerText = getPieceUnicode(square) ;
                pieceEle.draggable = playerRole === square.color ; //white can only drag white piece
                // console.log(playerRole);
                

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

    console.log('rendering board..... ended');

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
    console.log('1. playerRole in chessgame.js');
    
    const pieceColor = role==="w" ? "WHITE" : "BLACK" ;
    console.log(`You are assigned with ${pieceColor} pieces`); 
    playerRole = role ;
    renderBoard();
});
socket.on("spectatorRole" , function() { 
    console.log('1. spectatorRole in chessgame.js');
    console.log("1. You are a spectator");
    playerRole = null ;
    renderBoard();
});

socket.on("boardState" , function(fen) { 
    console.log('7. boardState in chessgame.js');

    chess.load(fen);
    renderBoard();
});
socket.on("move" , function(curMove) { 
    console.log('6. move in chessgame.js');

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
    
            
            //highlight last move 
            highlightPlaceAfterMove( data.result.from );
            highlightPlaceAfterMove( data.result.to );



    
        } else {
            console.log(data.error);
        }
    } catch (error) {
        console.log(error);
    }

});

function highlightPlaceAfterMove( pos ) {
    const r = 8-pos[1] ;
    const c = (pos[0]).charCodeAt(0) - 97;
    const start = getTargetBox(r, c); 
    if (start) {
        start.style.backgroundColor =  "#a8dd16";
    }            
}

function getTargetBox(row, col) {
    const gridItems = document.querySelectorAll('.square');

    for (const item of gridItems) {
      if (item.dataset.row === row.toString() && item.dataset.col === col.toString()) {
        // console.log(item);
        return item;
      }
    }
    return null;
}




// reset button functionality 
const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', () => {
    socket.emit('resetGame');
});
socket.on("resetGameConfirmed" , function() { 
    console.log('resetGameConfirmed in chessgame.js');

    // Storing data
    const data = {
        fen : chess.fen(),
        cpText : cp.innerHTML ,
        gsText : gs.innerHTML ,
        grText : gr.innerHTML ,
        pText : p.innerHTML ,
    }
    sessionStorage.setItem('gameState', JSON.stringify(data));

    chess.reset();
    cp.innerHTML = "White to play now"
    gs.innerHTML = "Game Status : continues"
    gr.innerHTML = "Game Result : None"
    p.innerHTML = "Opponent's Late Move : None"
    renderBoard();  
});


//new button functionality 
const newGameButton = document.getElementById('newGameButton');
newGameButton.addEventListener('click', () => {
    socket.emit('newGameButton');
});
socket.on("newGameConfirmed" , function() { 
    console.log('newGameConfirmed in chessgame.js');

    chess.reset();

    // Storing data
    const data = {
        fen : chess.fen(),
        cpText : "White to play now" ,
        gsText : "Game Status : continues" ,
        grText : "Game Status : continues" ,
        pText : "Opponent's Late Move : None" ,
    }
    sessionStorage.setItem('gameState', JSON.stringify(data));
    
    cp.innerHTML = "White to play now"
    gs.innerHTML = "Game Status : continues"
    gr.innerHTML = "Game Status : continues"
    p.innerHTML = "Opponent's Late Move : None"
    renderBoard();  
});


//load button functionality 
const loadButton = document.getElementById('loadButton');
loadButton.addEventListener('click', () => {
    socket.emit('loadButton');
});
socket.on("loadGameConfirmed" , function() { 
    console.log('loadGameConfirmed in chessgame.js');

    // Retrieving data
    const savedGameState = JSON.parse(sessionStorage.getItem('gameState'));
    if (savedGameState) {
        console.log(savedGameState);
        chess.reset();
        chess.load( savedGameState.fen );
        cp.innerHTML = savedGameState.cpText;
        gs.innerHTML = savedGameState.gsText;
        gr.innerHTML = savedGameState.grText;
        p.innerHTML = savedGameState.pText;
        renderBoard();
    
    } else {
        console.log('no data');
    }
});



function saveState() {
    console.log('saving data');
    
    const data = {
        fen : chess.fen(),
        cpText : cp.innerHTML ,
        gsText : gs.innerHTML ,
        grText : gr.innerHTML ,
        pText : p.innerHTML ,
    }
    sessionStorage.setItem('gameState', JSON.stringify(data));
    console.log('data');
    console.log(data);
    
    
}
  
function loadState() {
    console.log('retrieving data');
    
    // Retrieving data
    const savedGameState = JSON.parse(sessionStorage.getItem('gameState'));
    if (savedGameState) {
        console.log(savedGameState);
        chess.reset();
        chess.load( savedGameState.fen );
        cp.innerHTML = savedGameState.cpText;
        gs.innerHTML = savedGameState.gsText;
        gr.innerHTML = savedGameState.grText;
        p.innerHTML = savedGameState.pText;
        renderBoard()
    } else {
        console.log('no data');
    }

}

// Save state before reload
window.addEventListener('beforeunload', saveState);

// Load state on page load
window.addEventListener('load', loadState);


renderBoard();



