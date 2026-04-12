import helperFunctions from "../helper.function.js";

/**
 * Heuristic evaluation of the board state.
 * Scores potential winning lines, prioritizes blocking imminent opponent wins,
 * and slightly prefers central positions to encourage natural play.
 *
 * The evaluation scans all possible segments of length `winLength` in four
 * directions (horizontal, vertical, and two diagonals), counting AI marks,
 * opponent marks, and empty cells. Scores are accumulated based on these counts.
 *
 * @param {string[][]} board - Current game board.
 * @param {string} markup - AI mark ('x' or 'o').
 * @param {number} [winLength=3] - Number of consecutive marks required to win.
 * @returns {number} Heuristic score where positive favors AI and negative favors opponent.
 */
const evaluateBoard = (board, markup, winLength = 3) => {
   const opponent = markup === "x" ? "o" : "x";
   let score = 0;

   const directions = [
      [1, 0], // horizontal
      [0, 1], // vertical
      [1, 1], // diagonal down-right
      [1, -1], // diagonal down-left
   ];

   // Scan each direction to analyze potential winning segments
   for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
         for (const [dRow, dCol] of directions) {
            let aiCount = 0;
            let opponentCount = 0;
            let emptyCount = 0;

            for (let i = 0; i < winLength; i++) {
               const r = row + dRow * i;
               const c = col + dCol * i;
               if (r < 0 || r >= board.length || c < 0 || c >= board[r].length) break;

               const cell = board[r][c];
               if (cell === markup) aiCount++;
               else if (cell === opponent) opponentCount++;
               else emptyCount++;
            }

            // Terminal-like scoring
            if (opponentCount === 0 && aiCount === winLength) score += 1000000;
            if (aiCount === 0 && opponentCount === winLength) score -= 1000000;

            // One move away from winning / losing
            if (opponentCount === 0 && aiCount === winLength - 1 && emptyCount === 1)
               score += 20000;

            if (aiCount === 0 && opponentCount === winLength - 1 && emptyCount === 1)
               score -= 40000;

            // General positional heuristics
            if (aiCount > 0 && opponentCount === 0)
               score += Math.pow(aiCount, 3) + emptyCount;
            else if (opponentCount > 0 && aiCount === 0)
               score -= Math.pow(opponentCount, 3) + emptyCount;
         }
      }
   }

   // Slightly prefer central positions
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
 * Minimax algorithm with alpha-beta pruning.
 * Recursively explores possible game states and evaluates them using
 * terminal win detection or heuristic evaluation at the depth limit.
 *
 * Move ordering is applied to improve pruning efficiency.
 *
 * @param {string[][]} board - Current board state.
 * @param {string} markup - AI mark ('x' or 'o').
 * @param {number} depth - Current recursion depth.
 * @param {boolean} isMaximizing - Whether the current branch maximizes the AI score.
 * @param {number} alpha - Alpha bound for pruning.
 * @param {number} beta - Beta bound for pruning.
 * @param {number} maxDepth - Maximum recursion depth.
 * @param {number} winLength - Number of consecutive marks required to win.
 * @returns {number} Evaluation score of the board state.
 */
const minimax = (
   board,
   markup,
   depth,
   isMaximizing,
   alpha,
   beta,
   maxDepth,
   winLength,
) => {
   const winner = helperFunctions.getWinner(board, null, winLength);
   const opponent = markup === "x" ? "o" : "x";

   // Terminal state evaluation
   if (winner !== null) {
      if (winner === markup) return 10000 - depth;
      if (winner === opponent) return depth - 10000;
      return 0;
   }

   // Depth limit reached → heuristic evaluation
   if (depth >= maxDepth) {
      return evaluateBoard(board, markup, winLength);
   }

   const availableMoves = helperFunctions.getAvailableMoves(board);

   const relevantAvailableMoves = helperFunctions.getRelevantAvailableMoves(
      board,
      availableMoves,
   );

   const orderedRelevantAvailableMoves = helperFunctions.orderAvailableMoves(
      board,
      relevantAvailableMoves,
      isMaximizing ? markup : opponent,
   );

   if (isMaximizing) {
      let maxEval = -Infinity;

      for (const [row, col] of orderedRelevantAvailableMoves) {
         board[row][col] = markup;

         const evalScore = minimax(
            board,
            markup,
            depth + 1,
            false,
            alpha,
            beta,
            maxDepth,
            winLength,
         );

         board[row][col] = "e";

         maxEval = Math.max(maxEval, evalScore);
         alpha = Math.max(alpha, evalScore);

         // Alpha-beta pruning
         if (beta <= alpha) break;
      }

      return maxEval;
   } else {
      let minEval = Infinity;

      for (const [row, col] of orderedRelevantAvailableMoves) {
         board[row][col] = opponent;

         const evalScore = minimax(
            board,
            markup,
            depth + 1,
            true,
            alpha,
            beta,
            maxDepth,
            winLength,
         );

         board[row][col] = "e";

         minEval = Math.min(minEval, evalScore);
         beta = Math.min(beta, evalScore);

         // Alpha-beta pruning
         if (beta <= alpha) break;
      }

      return minEval;
   }
};

/**
 * Determines the best move for the AI using a three-step strategy:
 *
 * 1. Immediate winning move detection
 * 2. Immediate blocking move if opponent can win next turn
 * 3. Minimax search with alpha-beta pruning otherwise
 *
 * Only relevant moves are evaluated and ordered to improve performance.
 *
 * @function hardMove
 * @param {string[][]} board - Current board state.
 * @param {string} markup - AI mark ('x' or 'o').
 * @param {number} [winLength=3] - Number of consecutive marks required to win.
 * @param {number} [maxDepth=3] - Maximum minimax recursion depth.
 * @returns {{
 *   board: string[][],
 *   lastMove: { row: number, column: number } | null
 * }} Updated board and coordinates of the selected move.
 */
const hardMove = (board, markup, winLength = 3, maxDepth = 3) => {
   const opponent = markup === "x" ? "o" : "x";

   const availableMoves = helperFunctions.getAvailableMoves(board);

   const relevantAvailableMoves = helperFunctions.getRelevantAvailableMoves(
      board,
      availableMoves,
   );

   const orderedRelevantAvailableMoves = helperFunctions.orderAvailableMoves(
      board,
      relevantAvailableMoves,
      markup,
   );

   if (!relevantAvailableMoves.length) return { board, lastMove: null };

   // Step 1: Immediate winning move
   for (const [row, col] of orderedRelevantAvailableMoves) {
      const temp = board.map((r) => [...r]);
      temp[row][col] = markup;

      if (helperFunctions.getWinner(temp, null, winLength) === markup) {
         return {
            board: temp,
            lastMove: { row, column: col },
         };
      }
   }

   // Step 2: Block opponent immediate win
   for (const [row, col] of orderedRelevantAvailableMoves) {
      const temp = board.map((r) => [...r]);
      temp[row][col] = opponent;

      if (helperFunctions.getWinner(temp, null, winLength) === opponent) {
         const newBoard = board.map((r) => [...r]);
         newBoard[row][col] = markup;

         return {
            board: newBoard,
            lastMove: { row, column: col },
         };
      }
   }

   // Step 3: Minimax search
   let bestScore = -Infinity;
   let bestMove = null;

   for (const [row, col] of orderedRelevantAvailableMoves) {
      board[row][col] = markup;

      const moveScore = minimax(
         board,
         markup,
         0,
         false,
         -Infinity,
         Infinity,
         maxDepth,
         winLength,
      );

      board[row][col] = "e";

      if (moveScore > bestScore) {
         bestScore = moveScore;
         bestMove = { row, column: col };
      }
   }

   if (!bestMove) return { board, lastMove: null };

   const newBoard = board.map((r) => [...r]);
   newBoard[bestMove.row][bestMove.column] = markup;

   return {
      board: newBoard,
      lastMove: bestMove,
   };
};

export default hardMove;
