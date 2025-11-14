import helperFunctions from "./helper.function.js";
import easyMove from "./levels/easy.js";
import hardMove from "./levels/hard.js";
import mediumMove from "./levels/medium.js";
import veryEasyMove from "./levels/very-easy-mode.js";

/**
 * Handles AI move generation across all difficulty levels.
 * The AI first identifies the currently used region of the board,
 * optionally expands it if marks are near its edges, and then computes
 * the next optimal move based on the selected difficulty.
 *
 * @param {string[][]} board - The full game board.
 * @param {string|null} markup - The AI's mark ('x' or 'o'); if null, auto-determined.
 * @param {'very-easy'|'easy'|'medium'|'hard'} hardness - Difficulty level.
 * @param {{row: number, column: number}|null} lastMove - Last move made on the board.
 * @returns {{
 *   winner: string|null,
 *   region: { startRow: number, endRow: number, startColumn: number, endColumn: number },
 *   lastMove: { row: number, column: number },
 *   board: string[][]
 * }}
 */
function aiMove(board, markup = null, hardness, lastMove) {
   // Determine which mark to play ('x' or 'o')
   markup = !markup ? helperFunctions.getNextMarkup(board) : markup;

   const winLength = helperFunctions.getWinLength(board);

   const hasAlreadyWinner = helperFunctions.getWinner(board, null, winLength);
   console.log(hasAlreadyWinner);
   if (hasAlreadyWinner) {
      return {
         winner: hasAlreadyWinner,
         region: null,
         lastMove: lastMove,
         board: board,
      };
   }
   // Run an initial sanity check (board size, symbols, etc.)
   helperFunctions.startCheck(board, markup, hardness, null, lastMove);

   // --- First move (empty board) ---
   if (helperFunctions.isBoardEmpty(board)) {
      const startBoard = board.map((row) => [...row]);
      const startCoordinates = helperFunctions.randomStart(board);
      startBoard[startCoordinates.row][startCoordinates.column] = markup;

      return {
         winner: null,
         region: null,
         lastMove: { row: startCoordinates.row, column: startCoordinates.column },
         board: startBoard,
      };
   }

   // --- Identify region in use ---
   let usedRegion = helperFunctions.extractUsedRegion(board);

   // 🔍 NEW: Expand region if there are marks at its edges
   // This ensures the AI can "see" just beyond the current play zone
   usedRegion = helperFunctions.expandRegionIfEdgeHasMark(board, usedRegion);

   // --- Slice the region for localized AI processing ---
   let usedBoard = helperFunctions.sliceRegion(board, usedRegion);

   // Get available moves and current winner
   let availableMoves = helperFunctions.getAvailableMoves(usedBoard);
   const winner = helperFunctions.getWinner(board, null, winLength);

   helperFunctions.startCheck(board, markup, hardness, usedRegion, lastMove);

   // --- Early termination if someone has won or the board is full ---
   if (winner || helperFunctions.isBoardFull(board)) {
      return { winner, usedRegion, lastMove, board };
   }

   // --- If region has no available moves, expand further ---
   while (!availableMoves.length && !helperFunctions.isBoardFull(board)) {
      usedRegion = helperFunctions.expandRegion(usedRegion, board.length, hardness === "hard" ? 2 : 1);
      usedBoard = helperFunctions.sliceRegion(board, usedRegion);
      availableMoves = helperFunctions.getAvailableMoves(usedBoard);
   }

   // --- AI move selection based on difficulty ---
   let result;
   switch (hardness) {
      case "very-easy":
         result = veryEasyMove(usedBoard);
         break;
      case "easy":
         result = easyMove(usedBoard, lastMove || null);
         break;
      case "medium":
         result = mediumMove(usedBoard, lastMove || null, winLength);
         break;
      case "hard":
         result = hardMove(usedBoard, markup, winLength, 3);
         break;
      default:
         throw new Error(`Unknown difficulty level: ${hardness}`);
   }

   // --- Paste updated region back into the full board ---
   helperFunctions.pasteRegion(board, usedRegion, result.board);

   // --- Return computed state ---
   return {
      winner: helperFunctions.getWinner(board, null, winLength),
      region: usedRegion,
      lastMove: {
         row: result.lastMove.row + usedRegion.startRow,
         column: result.lastMove.column + usedRegion.startColumn,
      },
      board,
   };
}

export default aiMove;
