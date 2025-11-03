import helperFunctions from './helper.function';

/**
 * Heuristic evaluation function for the board.
 * Dynamically considers winLength and potential winning lines for both players.
 * @param {string[][]} board - The current game board.
 * @param {string} markup - The AI's mark ('x' or 'o').
 * @param {number} [winLength=3] - Number of consecutive marks required to win.
 * @returns {number} The heuristic score: positive favors AI, negative favors opponent.
 */
function evaluateBoard(board, markup, winLength = 3) {
  const opponent = markup === 'x' ? 'o' : 'x';
  let score = 0;

  const directions = [
    [1, 0],   // row
    [0, 1],   // column
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      for (const [dirRow, dirCol] of directions) {
        let aiCount = 0;
        let opponentCount = 0;

        for (let i = 0; i < winLength; i++) {
          const r = row + dirRow * i;
          const c = col + dirCol * i;
          if (r < 0 || c < 0 || r >= board.length || c >= board.length) break;

          const cell = board[r][c];
          if (cell === markup) aiCount++;
          else if (cell === opponent) opponentCount++;
        }

        // Lines containing only AI marks increase the score quadratically
        if (aiCount > 0 && opponentCount === 0)
          score += Math.pow(aiCount, 2) * 5;
        // Lines containing only opponent marks decrease the score quadratically
        else if (opponentCount > 0 && aiCount === 0)
          score -= Math.pow(opponentCount, 2) * 6;
      }
    }
  }

  // Central cell preference: reward AI marks closer to the center
  const mid = Math.floor(board.length / 2);
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === markup) {
        const dist = Math.abs(row - mid) + Math.abs(col - mid);
        score += Math.max(0, 4 - dist);
      }
    }
  }

  return score;
}

/**
 * Depth-limited minimax algorithm with alpha–beta pruning.
 * Uses evaluateBoard when reaching maxDepth to estimate board states.
 * @param {string[][]} board - Current board state.
 * @param {string} markup - AI's mark ('x' or 'o').
 * @param {number} depth - Current recursion depth.
 * @param {boolean} isMaximizing - True if maximizing AI score, false if minimizing opponent.
 * @param {number} alpha - Alpha value for alpha–beta pruning.
 * @param {number} beta - Beta value for alpha–beta pruning.
 * @param {number} maxDepth - Maximum search depth.
 * @param {number} winLength - Number of consecutive marks required to win.
 * @returns {number} Evaluation score for this board state.
 */
function minimax(board, markup, depth, isMaximizing, alpha, beta, maxDepth, winLength) {
  const winner = helperFunctions.getWinner(board, null, winLength);
  const opponent = markup === 'x' ? 'o' : 'x';

  // Terminal state: win, loss, or draw
  if (winner !== null) {
    if (winner === markup) return 1000 - depth;
    if (winner === opponent) return depth - 1000;
    return 0;
  }

  // Depth limit reached: evaluate heuristically
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
      if (beta <= alpha) break; // prune remaining branches
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
      if (beta <= alpha) break; // prune remaining branches
    }
    return minEval;
  }
}

/**
 * Finds the best move for the AI using minimax with depth limit and heuristic evaluation.
 * @param {string[][]} board - Current game board.
 * @param {string} markup - AI's mark ('x' or 'o').
 * @param {number} [winLength=3] - Number of consecutive marks required to win.
 * @param {number} [maxDepth=3] - Maximum search depth for minimax.
 * @returns {{row: number, column: number}} The best move coordinates for the AI.
 */
function findBestMove(board, markup, winLength = 3, maxDepth = 3) {
  let bestScore = -Infinity;
  let bestMove = null;
  const availableMoves = helperFunctions.getAvailableMoves(board);

  for (const [row, col] of availableMoves) {
    board[row][col] = markup;
    const moveScore = minimax(board, markup, 0, false, -Infinity, Infinity, maxDepth, winLength);
    board[row][col] = '';
    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = { row, column: col };
    }
  }

  return bestMove;
}

export default findBestMove
