import helperFunctions from "../helper.function.js";

function easyMove(board, lastMove = null) {
    if (helperFunctions.isBoardFull(board))
        throw new Error('No available moves');

    const markup = helperFunctions.getNextMarkup(board);
    let availableMoves = helperFunctions.getAvailableMoves(board);

    if (lastMove) {
        const { row, column } = lastMove;
        const neighbors = availableMoves.filter(([r, c]) => 
            Math.abs(r - row) <= 1 && Math.abs(c - column) <= 1
        );
        availableMoves = neighbors.length > 0 ? neighbors : availableMoves;
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    const [row, column] = availableMoves[randomIndex];

    const newBoard = board.map(r => [...r]);
    newBoard[row][column] = markup;

    console.log('easy')

    return {
        board: newBoard,
        lastMove: { row, column },
    };
}

export default easyMove