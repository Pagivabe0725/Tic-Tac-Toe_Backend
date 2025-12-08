import helperFunctions from "../helper.function.js";

/**
 * Generate an "easy" AI move by choosing a random available cell.
 * If `lastMove` is provided the AI prefers nearby cells (neighbors),
 * otherwise it chooses uniformly among all empty cells.
 *
 * @param {string[][]} board - The current game board (2D array of strings).
 * @param {{row:number,column:number}|null} [lastMove=null] - Optional last move to bias selection.
 * @throws {Error} When the board is full and no moves are available.
 * @returns {{board:string[][], lastMove:{row:number,column:number}}} The updated board and the chosen move.
 */
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