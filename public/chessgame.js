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
            
            console.log(rowIndex,colIndex);

            
            //marker a-h and 1-8
            if( colIndex==0 ){
                sqEle.classList.add('number');
                const markerEle = document.createElement("div");
                markerEle.classList.add("digit" , rowIndex%2==0 ? "blackAlphaNum" : "whiteAlphaNum" );
                    markerEle.innerText = 8-rowIndex ;                
                sqEle.appendChild(markerEle);

                if( playerRole=="b" ){
                    markerEle.classList.add('toLeft');
                    markerEle.classList.add(rowIndex%2==1 ? "blackAlphaNum" : "whiteAlphaNum" );
                    markerEle.classList.remove(rowIndex%2==0 ? "blackAlphaNum" : "whiteAlphaNum" );
                } else{
                     markerEle.classList.remove('toLeft');
                     markerEle.classList.remove(rowIndex%2==1 ? "blackAlphaNum" : "whiteAlphaNum" );
                     markerEle.classList.add(rowIndex%2==0 ? "blackAlphaNum" : "whiteAlphaNum" );
                }
            }

            if( rowIndex==7 ){
                sqEle.classList.add('alpha');
                const markerEle = document.createElement("div");
                markerEle.classList.add("letter" , colIndex%2==1 ? "blackAlphaNum" : "whiteAlphaNum" );
                markerEle.innerText = String.fromCharCode(colIndex + 97);                
                sqEle.appendChild(markerEle);

                if( playerRole=="b" ){
                    markerEle.classList.add('toBottom');
                    markerEle.classList.add(colIndex%2==0 ? "blackAlphaNum" : "whiteAlphaNum" );
                    markerEle.classList.remove(colIndex%2==1 ? "blackAlphaNum" : "whiteAlphaNum" );
                } else{
                     markerEle.classList.remove('toBottom');
                     markerEle.classList.remove(colIndex%2==0 ? "blackAlphaNum" : "whiteAlphaNum" );
                     markerEle.classList.add(colIndex%2==1 ? "blackAlphaNum" : "whiteAlphaNum" );
                }


            }
            
                
            
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


const pid = document.querySelector("#playerId");

socket.on("playerRole" , function({role,isOpponentAlreadyThere}) { 
    console.log('1. playerRole in chessgame.js');
    
    const pieceColor = role==="w" ? "WHITE" : "BLACK" ;

    pid.innerHTML = "You are playing with "
    pid.innerHTML += role==="w" ? "White" : "Black"
    pid.innerHTML += " side"

    if ( isOpponentAlreadyThere ) {
        console.log('Opponent is there');
        
        const lastMove = JSON.parse(localStorage.getItem('details'));
        console.log(lastMove);
        cp.innerHTML  = lastMove.cpText  
        gs.innerHTML  = lastMove.gsText 
        gr.innerHTML  = lastMove.grText 
        p.innerHTML  = lastMove.pText  
    } else {
        console.log('Opponent is not there');

        details = {
            cpText : cp.innerHTML, 
            gsText : gs.innerHTML ,
            grText : gr.innerHTML ,
            pText : p.innerHTML ,
        }
        console.log(details);
        localStorage.setItem('details', JSON.stringify(details));
      }
      
    console.log(`You are assigned with ${pieceColor} pieces`); 
    playerRole = role ;
    renderBoard();
});
socket.on("spectatorRole" , function() { 
    console.log('1. spectatorRole in chessgame.js');
    console.log("1. You are a spectator");
    playerRole = null ;
    pid.innerHTML = "You are a Spectator"

    const lastMove = JSON.parse(localStorage.getItem('details'));
    console.log(lastMove);
    cp.innerHTML  = lastMove.cpText  
    gs.innerHTML  = lastMove.gsText 
    gr.innerHTML  = lastMove.grText 
    p.innerHTML  = lastMove.pText  


    resetButton.style.display = 'none'
    newGameButton.style.display = 'none'
    loadButton.style.display = 'none'

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


socket.on("updateChessBoard" , function(fen) { 
    console.log('updateChessBoard');
    chess.load(fen);
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
    
            
            
            
            
            details = {
                cpText : cp.innerHTML, 
                gsText : gs.innerHTML ,
                grText : gr.innerHTML ,
                pText : p.innerHTML ,
            }
            console.log(details);
            
            localStorage.setItem('details', JSON.stringify(details));
            



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


// Buttons 


let canLoad = false;

// reset button functionality 
const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', () => {
    canLoad = true;
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


    details = {
        cpText : cp.innerHTML, 
        gsText : gs.innerHTML ,
        grText : gr.innerHTML ,
        pText : p.innerHTML ,
    }
    console.log(details);    
    localStorage.setItem('details', JSON.stringify(details));

    
    renderBoard();  
});


//new button functionality 
const newGameButton = document.getElementById('newGameButton');
newGameButton.addEventListener('click', () => {
    canLoad = true ;
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
        grText : "Game Result : None" ,
        pText : "Opponent's Late Move : None" ,
    }
    sessionStorage.setItem('gameState', JSON.stringify(data));
    
    cp.innerHTML = "White to play now"
    gs.innerHTML = "Game Status : continues"
    gr.innerHTML = "Game Result : None"
    p.innerHTML = "Opponent's Late Move : None"
    

    details = {
        cpText : cp.innerHTML, 
        gsText : gs.innerHTML ,
        grText : gr.innerHTML ,
        pText : p.innerHTML ,
    }
    console.log(details);    
    localStorage.setItem('details', JSON.stringify(details));
    
    renderBoard();  
});


//load button functionality 
const loadButton = document.getElementById('loadButton');
loadButton.addEventListener('click', () => {
    if(canLoad)
        socket.emit('loadButton');
    else 
        console.log('Nothing to reload');
        
});
socket.on("loadGameConfirmed" , function() { 
    console.log('loadGameConfirmed in chessgame.js');


    // if( typeof sessionStorage == 'undefined' || sessionStorage.getItem('gameState') == null ){
    //     console.log("Nothing to load");
    //     return ;
    // }

    // const receivedData  = sessionStorage.getItem('gameState') ;

    // Retrieving data
    const savedGameState = JSON.parse(sessionStorage.getItem('gameState'));
    console.log(savedGameState);    
    
    if (savedGameState) {
        console.log(savedGameState);
        chess.reset();
        chess.load( savedGameState.fen );
        cp.innerHTML = savedGameState.cpText;
        gs.innerHTML = savedGameState.gsText;
        gr.innerHTML = savedGameState.grText;
        p.innerHTML = savedGameState.pText;

        details = {
            cpText : cp.innerHTML, 
            gsText : gs.innerHTML ,
            grText : gr.innerHTML ,
            pText : p.innerHTML ,
        }
        console.log(details);    
        localStorage.setItem('details', JSON.stringify(details));

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
    

    // if( typeof sessionStorage == 'undefined' || sessionStorage.getItem('gameState') == null ){
    //     console.log("Nothing to load");
    //     return ;
    // }
    // const receivedData  = sessionStorage.getItem('gameState') ;
    // console.log('received data -' , receivedData);
    


    // Retrieving data
    const savedGameState = JSON.parse(sessionStorage.getItem('gameState'));
    console.log(savedGameState);

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

}

// Save state before reload
window.addEventListener('beforeunload', saveState);

// Load state on page load
window.addEventListener('load', loadState);


renderBoard();



