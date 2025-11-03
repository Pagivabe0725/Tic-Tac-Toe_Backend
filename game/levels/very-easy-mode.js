import helperFunctions from "../helper.function";

function veryEasyMove(board) {
    if (helperFunctions.isBoardFull(board))
        throw new Error('No available moves');

    const markup = helperFunctions.getNextMarkup(board);
    const availableMoves = helperFunctions.getAvailableMoves(board);

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    const [row, column] = availableMoves[randomIndex];

    const newBoard = board.map(r => [...r]);
    newBoard[row][column] = markup;

    return {
        board: newBoard,
        lastMove: { row, column }
    };
}

export default veryEasyMove;