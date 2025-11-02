import helperFunctions from "./helper.function";

function veryEasyMove(board, hardness = 'very-easy', region = null) {
    if (helperFunctions.isBoardFull(board))
        throw new Error('No available moves');

    const markup = helperFunctions.getNextMarkup(board);
    let actualRegion = region ? region : helperFunctions.extractUsedRegion(board);
    let usedBoardPart = actualRegion ? helperFunctions.sliceRegion(board, actualRegion) : board;

    let availableMoves = helperFunctions.getAvailableMoves(usedBoardPart);

    if (actualRegion) {
        while (!availableMoves.length) {
            actualRegion = helperFunctions.expandRegion(actualRegion, board.length);
            usedBoardPart = helperFunctions.sliceRegion(board, actualRegion);
            availableMoves = helperFunctions.getAvailableMoves(usedBoardPart);
        }
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    const [row, column] = availableMoves[randomIndex];

    usedBoardPart[row][column] = markup;
    const resultBoard = helperFunctions.pasteRegion(board, actualRegion, usedBoardPart);

    return {
        board: resultBoard,
        hardness: hardness,
        lastMove: { row: row, column:column },
        startRow: actualRegion?.startRow,
        startColumn: actualRegion?.startColumn,
        endRow: actualRegion?.endRow,
        endColumn: actualRegion?.endColumn
    };
}



export default veryEasyMove
