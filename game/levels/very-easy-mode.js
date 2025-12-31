import helperFunctions from "../helper.function.js";

/**
 * Very-easy AI: place a random mark anywhere on the board.
 * Chooses any empty cell uniformly at random.
 *
 * @param {string[][]} board - The current game board.
 * @throws {Error} If the board is full and no moves are available.
 * @returns {{board:string[][], lastMove:{row:number,column:number}}} The updated board and chosen move coordinates.
 */
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