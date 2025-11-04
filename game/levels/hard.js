import helperFunctions from '../helper.function.js';

/**
 * Heuristic evaluation function for the board.
 * Rewards the AI for potential winning lines and center control,
 * but prioritizes blocking the opponent when they are about to win.
 *
 * @param {string[][]} board - The current game board.
 * @param {string} markup - The AI's mark ('x' or 'o').
 * @param {number} [winLength=3] - Number of consecutive marks required to win.
 * @returns {number} The heuristic score: positive favors AI, negative favors opponent.
 */
const evaluateBoard = (board, markup, winLength = 3) => {
  const opponent = markup === 'x' ? 'o' : 'x';
  let score = 0;

  const directions = [
    [1, 0],   // horizontal
    [0, 1],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  // Scan each direction to analyze potential winning lines
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      for (const [dRow, dCol] of directions) {
        let aiCount = 0;
        let opponentCount = 0;
        let emptyCount = 0;

        for (let i = 0; i < winLength; i++) {
          const r = row + dRow * i;
          const c = col + dCol * i;
          if (r < 0 || c < 0 || r >= board.length || c >= board.length) break;

          const cell = board[r][c];
          if (cell === markup) aiCount++;
          else if (cell === opponent) opponentCount++;
          else emptyCount++;
        }

        // High-priority conditions
        if (aiCount === winLength) score += 5000; // winning line
        if (opponentCount === winLength) score -= 5000; // losing line
        if (aiCount === winLength - 1 && emptyCount === 1) score += 1500; // one move away from winning
        if (opponentCount === winLength - 1 && emptyCount === 1) score -= 2000; // block urgently

        // General heuristics
        if (aiCount > 0 && opponentCount === 0)
          score += Math.pow(aiCount, 3) + emptyCount;
        else if (opponentCount > 0 && aiCount === 0)
          score -= Math.pow(opponentCount, 3) + emptyCount;
      }
    }
  }

  // Slightly prefer the center — encourages more natural play
  const mid = Math.floor(board.length / 2);
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === markup) {
        const dist = Math.abs(row - mid) + Math.abs(col - mid);
        score += Math.max(0, 5 - dist);
      }
    }
  }

  return score;
};

/**
 * Minimax algorithm with alpha-beta pruning and heuristic evaluation.
 * Recursively explores possible game states up to a defined depth.
 *
 * @param {string[][]} board - Current board state.
 * @param {string} markup - AI's mark ('x' or 'o').
 * @param {number} depth - Current recursion depth.
 * @param {boolean} isMaximizing - True if maximizing AI score, false if minimizing opponent.
 * @param {number} alpha - Alpha value for pruning.
 * @param {number} beta - Beta value for pruning.
 * @param {number} maxDepth - Maximum recursion depth.
 * @param {number} winLength - Number of consecutive marks required to win.
 * @returns {number} Evaluation score of this board state.
 */
const minimax = (board, markup, depth, isMaximizing, alpha, beta, maxDepth, winLength) => {
  const winner = helperFunctions.getWinner(board, null, winLength);
  const opponent = markup === 'x' ? 'o' : 'x';

  // Terminal state
  if (winner !== null) {
    if (winner === markup) return 10000 - depth;
    if (winner === opponent) return depth - 10000;
    return 0;
  }

  // Stop search and use heuristic evaluation
  if (depth >= maxDepth) {
    return evaluateBoard(board, markup, winLength);
  }

  const availableMoves = helperFunctions.getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const [row, col] of availableMoves) {
      board[row][col] = markup;
      const evalScore = minimax(board, markup, depth + 1, false, alpha, beta, maxDepth, winLength);
      board[row][col] = '';
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // prune
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const [row, col] of availableMoves) {
      board[row][col] = opponent;
      const evalScore = minimax(board, markup, depth + 1, true, alpha, beta, maxDepth, winLength);
      board[row][col] = '';
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // prune
    }
    return minEval;
  }
};

/**
 * Determines the best move for the AI using:
 *  1. Immediate win detection
 *  2. Immediate block if opponent is about to win
 *  3. Minimax with alpha–beta pruning otherwise
 *
 * Returns both the updated board and the move coordinates.
 *
 * @function hardMove
 * @param {string[][]} board - The current board state.
 * @param {string} markup - The AI's mark ('x' or 'o').
 * @param {number} [winLength=3] - Number of consecutive marks required to win.
 * @param {number} [maxDepth=3] - Maximum recursion depth for minimax.
 * @returns {{
 *   board: string[][],
 *   lastMove: { row: number, column: number } | null
 * }} The updated board and the coordinates of the AI's chosen move.
 */
const hardMove = (board, markup, winLength = 3, maxDepth = 3) => {
  const opponent = markup === 'x' ? 'o' : 'x';
  const availableMoves = helperFunctions.getAvailableMoves(board);
  if (!availableMoves.length) return { board, lastMove: null };

  // Step 1: Try to win immediately
  for (const [row, col] of availableMoves) {
    const temp = board.map(r => [...r]);
    temp[row][col] = markup;
    if (helperFunctions.getWinner(temp, null, winLength) === markup) {
      return {
        board: temp,
        lastMove: { row, column: col }
      };
    }
  }

  // Step 2: Block opponent's immediate win
  for (const [row, col] of availableMoves) {
    const temp = board.map(r => [...r]);
    temp[row][col] = opponent;
    if (helperFunctions.getWinner(temp, null, winLength) === opponent) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = markup;
      return {
        board: newBoard,
        lastMove: { row, column: col }
      };
    }
  }

  // Step 3: Otherwise, use minimax for the best strategic move
  let bestScore = -Infinity;
  let bestMove = null;

  for (const [row, col] of availableMoves) {
    board[row][col] = markup;
    const moveScore = minimax(board, markup, 0, false, -Infinity, Infinity, 3, winLength);
    board[row][col] = '';

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = { row, column: col };
    }
  }

  if (!bestMove) return { board, lastMove: null };

  const newBoard = board.map(r => [...r]);
  newBoard[bestMove.row][bestMove.column] = markup;

  return {
    board: newBoard,
    lastMove: bestMove
  };
};

export default hardMove;
