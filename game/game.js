import helperFunctions from "./helper.function.js";
import easyMove from "./levels/easy.js";
import hardMove from "./levels/hard.js";
import mediumMove from "./levels/medium.js";
import veryEasyMove from "./levels/very-easy-mode.js";

/**
 * Computes the AI move for the given board and difficulty level.
 *
 * The algorithm:
 * 1. Determines the active region of the board
 * 2. Expands the region when marks are near its edges
 * 3. Runs the selected difficulty AI on the localized region
 * 4. Pastes the result back into the full board
 *
 * Region-based evaluation improves performance on large boards by limiting
 * computation to the currently relevant play area.
 *
 * @param {string[][]} board - Full game board.
 * @param {string|null} markup - AI mark ('x' or 'o'); auto-detected if null.
 * @param {'very_easy'|'easy'|'medium'|'hard'} hardness - AI difficulty level.
 * @param {{row: number, column: number}|null} lastMove - Last move played on the board.
 * @returns {{
 *   winner: string|null,
 *   region: { startRow: number, endRow: number, startColumn: number, endColumn: number } | null,
 *   lastMove: { row: number, column: number } | null,
 *   board: string[][]
 * }} Updated game state after the AI move.
 */
function aiMove(board, markup = null, hardness, lastMove) {
   // Determine which mark the AI should use
   markup = !markup ? helperFunctions.getNextMarkup(board) : markup;

   const winLength = helperFunctions.getWinLength(board);

   const hasAlreadyWinner = helperFunctions.getWinner(board, null, winLength);
   if (hasAlreadyWinner) {
      return {
         winner: hasAlreadyWinner,
         region: null,
         lastMove: lastMove,
         board: board,
      };
   }

   // Initial validation (board size, symbols, parameters, etc.)
   helperFunctions.startCheck(board, markup, hardness, null, lastMove);

   // --- First move on empty board ---
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

   // --- Detect currently used region of the board ---
   let usedRegion = helperFunctions.extractUsedRegion(board);

   // Expand to full board for small boards,
   // otherwise expand when marks appear on region edges
   const regionTemplate = {
      endRow: board.length - 1,
      endColumn: board.length - 1,
      startColumn: 0,
      startRow: 0,
   };

   usedRegion =
      board.length <= 4
         ? regionTemplate
         : helperFunctions.expandRegionIfEdgeHasMark(board, usedRegion);

   // --- Slice localized board for AI processing ---
   let usedBoard =
      board.length <= 4
         ? board.map((r) => [...r])
         : helperFunctions.sliceRegion(board, usedRegion);

   let availableMoves = helperFunctions.getAvailableMoves(usedBoard);
   const winner = helperFunctions.getWinner(board, null, winLength);

   // Validate again with resolved region
   helperFunctions.startCheck(board, markup, hardness, usedRegion, lastMove);

   // --- Stop if game already finished ---
   if (winner || helperFunctions.isBoardFull(board)) {
      return { winner, usedRegion, lastMove, board };
   }

   // --- Expand region if no moves available inside it ---
   if (board.length > 4)
      while (!availableMoves.length && !helperFunctions.isBoardFull(board)) {
         usedRegion = helperFunctions.expandRegion(
            usedRegion,
            board.length,
            hardness === "hard" ? 2 : 1,
         );

         usedBoard = helperFunctions.sliceRegion(board, usedRegion);
         availableMoves = helperFunctions.getAvailableMoves(usedBoard);
      }

   // --- Select AI move based on difficulty ---
   let result;
   switch (hardness) {
      case "very_easy":
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

   // --- Merge AI result back into the full board ---
   helperFunctions.pasteRegion(board, usedRegion, result.board);

   // --- Return updated game state ---
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
