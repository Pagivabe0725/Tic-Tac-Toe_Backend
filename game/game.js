import helperFunctions from "./helper.function";

/*

function aiMove(board, markup, hardness, lastMove){

    
    if(helperFunctions.isBoardEmpty(board)){
        
    }

    const winner = helperFunctions.getWinner(board);
    let usedRegion = helperFunctions.extractUsedRegion(board);
    let usedBoard = helperFunctions.sliceRegion(board, usedRegion);
    let availableMoves = helperFunctions.getAvailableMoves(usedBoard);
    helperFunctions.startCheck(board, markup, hardness, usedRegion, lastMove);
    if (winner || helperFunctions.isBoardFull(board)) {
        return { winner, usedRegion, lastMove, board };
    }

  

    while (!availableMoves.length && !helperFunctions.isBoardFull()) {
        usedRegion = helperFunctions.expandRegion(usedRegion, board.length, hardness ==='hard' ? 2 : 1);
        usedBoard = helperFunctions.sliceRegion(board, usedRegion);
        availableMoves = helperFunctions.getAvailableMoves(usedBoard);
    }

    let result;
    switch (hardness) {
        case 'very-easy':
           // result = veryEasyMove(board, lastMove);
            break;
        case 'easy':
           // result = easyMove(board, lastMove);
            break;
        case 'medium':
           // result = mediumMove(board, lastMove);
            break;
        case 'hard':
            //result = hardMove(board, lastMove);
            break;
        default:
            throw new Error(`Unknown difficulty level: ${hardness}`);
    }

    return {
        winner: helperFunctions.getWinner(result.board),
        region: usedRegion,
        lastMove: result.lastMove,
        board: result.board
    };
}

*/