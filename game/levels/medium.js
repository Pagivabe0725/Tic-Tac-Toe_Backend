import helperFunctions from '../helper.function.js';

/**
 * Checks whether a given cell is in the central region of the board.
 * Central cells are considered more strategic.
 * @param {string[][]} board - The current game board.
 * @param {number} row - Row index of the cell.
 * @param {number} column - Column index of the cell.
 * @returns {boolean} True if the cell is within the central 3x3 area.
 */
function isCentralCell(board, row, column) {
  const middleIndex = (board.length - 1) / 2;
  return (
    Math.abs(row - middleIndex) <= 1 &&
    Math.abs(column - middleIndex) <= 1
  );
}

/**
 * Checks if a cell is adjacent to any of the AI's own marks.
 * Encourages clustering of marks for strategic advantage.
 * @param {string[][]} board - The current game board.
 * @param {number} row - Row index of the cell.
 * @param {number} column - Column index of the cell.
 * @param {string} markup - The AI's mark ('x' or 'o').
 * @returns {boolean} True if at least one neighboring cell contains the AI's mark.
 */
function isNearOwnMark(board, row, column, markup) {
  const directions = [-1, 0, 1];
  for (let deltaRow of directions) {
    for (let deltaColumn of directions) {
      if (deltaRow === 0 && deltaColumn === 0) continue;
      const neighborRow = row + deltaRow;
      const neighborColumn = column + deltaColumn;
      if (board[neighborRow]?.[neighborColumn] === markup) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Simulates placing a mark at a given cell and checks if it results in a win.
 * @param {string[][]} board - The current game board.
 * @param {number} row - Row index to test.
 * @param {number} column - Column index to test.
 * @param {string} markup - The mark to place ('x' or 'o').
 * @returns {boolean} True if placing the mark here results in a win.
 */
function wouldWinAfterMove(board, row, column, markup, winLength = 3) {
  const boardClone = board.map(boardRow => [...boardRow]);
  boardClone[row][column] = markup;
  return helperFunctions.getWinner(boardClone, null, winLength) === markup;
}


/**
 * Check whether placing `markup` at `[row,column]` would create a board
 * state where the specified mark is one move away from winning.
 *
 * This helper clones the board, applies the hypothetical move and then
 * checks for a near-win state using a reduced `winLength - 1` threshold.
 *
 * @param {string[][]} board - The current game board.
 * @param {number} row - Row index to test.
 * @param {number} column - Column index to test.
 * @param {string} markup - The mark to place ('x' or 'o').
 * @param {number} winLength - Number of marks required to win on this board size.
 * @returns {boolean} True if the move would put `markup` one step away from winning.
 */
function opponentAlmostWin(board , row, column , markup, winLength ){
  const boardClone = board.map(boardRow => [...boardRow])
  boardClone[row][column] = markup
  return helperFunctions.getWinner(boardClone, null, winLength-1) === markup
}

/**
 * Computes the AI's medium difficulty move using a simple heuristic system.
 * Heuristics include: winning moves, blocking opponent, central preference,
 * proximity to own marks, and closeness to the last move.
 * @param {string[][]} board - The current game board.
 * @param {{row: number, column: number}} lastMove - The last move made on the board.
 * @returns {{board: string[][], lastMove: {row: number, column: number}}} The new board and the AI's move.
 */
function mediumMove(board, lastMove, winLength) {
  const currentMarkup = helperFunctions.getNextMarkup(board);
  const opponentMarkup = currentMarkup === 'x' ? 'o' : 'x';
  const availableMoves = helperFunctions.getAvailableMoves(board);

  const scoredMoves = availableMoves.map(([row, column]) => {
    let score = 0;

    // 1. Winning opportunity for AI
    if (wouldWinAfterMove(board, row, column, currentMarkup, winLength)) {
      score += 100;
    }

    // 2. Block opponent's winning move
    if (wouldWinAfterMove(board, row, column, opponentMarkup , winLength)) {
      score += 90;
    }

    if(opponentAlmostWin(board, row, column, opponentMarkup, winLength)){
      score+=80
    }

    // 3. Prefer central cells
    if (isCentralCell(board, row, column)) {
      score += 10;
    }

    // 4. Favor proximity to own marks
    if (isNearOwnMark(board, row, column, currentMarkup)) {
      score += 5;
    }

    // 5. Favor moves near the last move
    if (lastMove) {
      const distance =
        Math.abs(row - lastMove.row) + Math.abs(column - lastMove.column);
      if (distance <= 1) score += 8; // directly adjacent
      else if (distance === 2) score += 4; // nearby
    }

    return { row, column, score };
  });

  // Select moves within 5 points of the maximum score for minor random variation
  const maximumScore = Math.max(...scoredMoves.map(move => move.score));
  const bestMoves = scoredMoves.filter(
    move => move.score >= maximumScore - 5
  );

  // Randomly choose among the top candidates
  const chosenMove =
    bestMoves[Math.floor(Math.random() * bestMoves.length)];

  // Apply chosen move to a new board
  const newBoard = board.map(boardRow => [...boardRow]);
  newBoard[chosenMove.row][chosenMove.column] = currentMarkup;


  console.log('medium')
  return {
    board: newBoard,
    lastMove: { row: chosenMove.row, column: chosenMove.column },
  };
}

export default mediumMove;
