/**
 * Validates that the provided board is a two-dimensional array containing only
 * valid cell values (`"x"`, `"o"`, or `"e"`).
 *
 * @param {string[][]} board - Two-dimensional array representing the game board.
 * @throws {TypeError} Thrown when the board is not a valid 2D array or contains invalid cell values.
 */
const checkBoard = (board) => {
   if (
      !Array.isArray(board) ||
      board.some(
         (row) =>
            !Array.isArray(row) || row.some((cell) => !["x", "o", "e"].includes(cell)),
      )
   ) {
      throw new TypeError(
         'Invalid board: must be a 2D array containing only "x", "o", "e".',
      );
   }
};

/**
 * Validates that the provided moves array contains valid `[row, column]` pairs.
 *
 * @param {Array<[number, number]>} moves - Array of `[row, column]` coordinate pairs.
 * @throws {TypeError} Thrown when moves is not an array of integer coordinate pairs.
 */
const checkAvailableMoves = (moves) => {
   if (
      !Array.isArray(moves) ||
      moves.some((element) => {
         return (
            !Array.isArray(element) ||
            element.length !== 2 ||
            element.some((value) => !Number.isInteger(value))
         );
      })
   ) {
      throw new TypeError("moves must be Array<[number, number]>");
   }
};

/**
 * Validates that the provided markup is either `"x"` or `"o"`.
 *
 * @param {"x" | "o"} markup - Player markup to validate.
 * @throws {TypeError} Thrown when the markup is not `"x"` or `"o"`.
 */
const checkMarkup = (markup) => {
   if (!["x", "o"].includes(markup)) {
      throw new TypeError('Invalid "markup": must be "x" or "o".');
   }
};

/**
 * Determines which markup (`"x"` or `"o"`) should be placed next based on the
 * current board state. The function counts existing marks and enforces a valid
 * turn order where `"x"` always starts and players alternate.
 *
 * @param {string[][]} board - Two-dimensional array representing the game board.
 * @returns {"x" | "o"} The markup that should be placed next.
 * @throws {Error} Thrown when the difference between `"x"` and `"o"` counts is invalid.
 */
const getNextMarkup = (board) => {
   let xCount = 0;
   let oCount = 0;

   for (const row of board) {
      for (const cell of row) {
         if (cell === "x") xCount++;
         else if (cell === "o") oCount++;
      }
   }

   if (![0, 1].includes(Math.abs(xCount - oCount))) {
      throw new Error('"Invalid board state: markup counts mismatch"');
   }

   return xCount > oCount ? "o" : "x";
};

/**
 * Checks whether the entire board is empty (all cells contain `"e"`).
 *
 * @param {string[][]} board - Two-dimensional array representing the game board.
 * @returns {boolean} Returns `true` if every cell is `"e"`, otherwise `false`.
 */
const isBoardEmpty = (board) => {
   return board.every((row) => row.every((cell) => cell === "e"));
};

/**
 * Checks whether the specified board cell is empty (`"e"`).
 *
 * @param {string[][]} board - Two-dimensional array representing the game board.
 * @param {number} row - Zero-based row index of the cell.
 * @param {number} col - Zero-based column index of the cell.
 * @returns {boolean} Returns `true` if the cell contains `"e"`, otherwise `false`.
 * @throws {RangeError} Thrown when the row or column index is outside the board bounds.
 */
const isEmptyField = (board, row, col) => {
   if (row < 0 || row >= board.length) {
      throw new RangeError("Invalid board row position");
   }

   if (col < 0 || col >= board[row].length) {
      throw new RangeError("Invalid board column position");
   }

   return board[row][col] === "e";
};

/**
 * Checks whether the board is full (contains no empty `"e"` cells).
 *
 * @param {string[][]} board - Two-dimensional array representing the game board.
 * @returns {boolean} Returns `true` if no empty cells are present, otherwise `false`.
 */
const isBoardFull = (board) => {
   for (const row of board) {
      for (const cell of row) {
         if (cell === "e") return false;
      }
   }
   return true;
};

/**
 * Returns a list of available moves as `[row, column]` pairs for empty cells.
 *
 * @param {string[][]} board - Two-dimensional array representing the game board.
 * @returns {Array<[number, number]>} Array of `[row, column]` pairs for each empty `"e"` cell.
 */
const getAvailableMoves = (board) => {
   const moves = [];
   board.forEach((row, i) => {
      row.forEach((cell, j) => {
         if (cell === "e") moves.push([i, j]);
      });
   });
   return moves;
};

/**
 * Filters the provided moves and returns only those that are adjacent to
 * at least one non-empty cell. A move is considered relevant if any of its
 * surrounding positions (including diagonals) contains `"x"` or `"o"`.
 *
 * @param {string[][]} board - Two-dimensional array representing the game board.
 * @param {Array<[number, number]>} moves - Array of `[row, column]` pairs to evaluate.
 * @returns {Array<[number, number]>} Array of relevant `[row, column]` moves.
 * @throws {TypeError} Thrown when the moves structure is invalid.
 */
const getRelevantAvailableMoves = (board, moves) => {
   checkAvailableMoves(moves);
   const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
   ];
   const relevantMoves = [];

   for (const move of moves) {
      const [row, column] = move;

      for (const [dRow, dCol] of directions) {
         const r = row + dRow;
         const c = column + dCol;

         const isValidPosition =
            r >= 0 && r < board.length && c >= 0 && c < board[r].length;

         if (isValidPosition && board[r][c] !== "e") {
            relevantMoves.push(move);
            break;
         }
      }
   }

   return relevantMoves;
};

/**
 * Orders available moves by heuristic relevance. Moves adjacent to the current
 * player's markup receive higher priority. The result is sorted in descending
 * score order.
 *
 * @param {string[][]} board - Two-dimensional array representing the game board.
 * @param {Array<[number, number]>} moves - Array of `[row, column]` pairs to order.
 * @param {"x" | "o"} markup - Current player's markup used for scoring.
 * @returns {Array<[number, number]>} New array of moves sorted by priority (highest first).
 * @throws {TypeError} Thrown when moves or markup are invalid.
 */
const orderAvailableMoves = (board, moves, markup) => {
   checkAvailableMoves(moves);
   checkMarkup(markup);

   const opponent = markup === "x" ? "o" : "x";

   const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
   ];

   const scoreMove = ([row, col]) => {
      let score = 0;
      board[row][col] = opponent;
      if (getWinner(board) === opponent) score += 100;
      board[row][col] = "e";

      for (const [dRow, dCol] of directions) {
         const r = row + dRow;
         const c = col + dCol;

         const isValidPosition =
            r >= 0 && r < board.length && c >= 0 && c < board[r].length;

         if (!isValidPosition) continue;

         if (col > Math.floor(board[row].length / 2)) score += 0.8;

         if (board[r][c] === markup) score += 2;
         else if (board[r][c] === opponent) score += 1;
      }

      return score;
   };

   return [...moves].sort((a, b) => scoreMove(b) - scoreMove(a));
};

/**
 * Iterates over each cell in a rectangular region and invokes `callback`.
 *
 * @param {string[][]} board - The full game board.
 * @param {{startColumn:number,endColumn:number,startRow:number,endRow:number}} region - Region bounds.
 * @param {(cell:string,row:number,col:number)=>void} callback - Invoked for each cell in the region.
 * @throws {Error} If `region` is missing required numeric properties.
 */
const forEachCellInRegion = (board, region, callback) => {
   const { startColumn, endColumn, startRow, endRow } = region;

   if (
      startColumn === undefined ||
      endColumn === undefined ||
      startRow === undefined ||
      endRow === undefined
   ) {
      throw new Error(
         "Invalid region object — must contain startColumn, endColumn, startRow, endRow",
      );
   }

   if (startColumn > endColumn || startRow > endRow) return;

   for (let row = startRow; row <= endRow; row++) {
      for (let col = startColumn; col <= endColumn; col++) {
         callback(board[row][col], row, col);
      }
   }
};

/**
 * Determines the winner in the given board or region, respecting `winLength`.
 *
 * @param {string[][]} board - The full game board.
 * @param {{startColumn:number,endColumn:number,startRow:number,endRow:number}|null} [region=null] - Optional region to check.
 * @param {number} [winLength=3] - Number of identical marks in a row required to win.
 * @returns {"x"|"o"|"draw"|null} Winner mark, "draw" when the board is full, or null if the game is ongoing.
 */
const getWinner = (board, region = null, winLength = 3) => {
   const boardSize = board.length;

   if (!region) {
      region = {
         startColumn: 0,
         startRow: 0,
         endColumn: boardSize - 1,
         endRow: boardSize - 1,
      };
   }

   const { startColumn, startRow, endColumn, endRow } = region;

   if (
      startColumn === undefined ||
      endColumn === undefined ||
      startRow === undefined ||
      endRow === undefined
   ) {
      throw new Error(
         "Invalid region object — must contain startColumn, endColumn, startRow, endRow",
      );
   }

   const width = endColumn - startColumn + 1;
   const height = endRow - startRow + 1;

   if (width < winLength || height < winLength) return null;

   const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
   ];

   let winner = null;

   forEachCellInRegion(board, region, (cell, row, col) => {
      if (winner || cell === "e") return;

      for (const [dirX, dirY] of directions) {
         let matchCount = 1;

         for (let step = 1; step < winLength; step++) {
            const newRow = row + dirX * step;
            const newCol = col + dirY * step;

            if (
               newRow < startRow ||
               newRow > endRow ||
               newCol < startColumn ||
               newCol > endColumn
            )
               break;

            if (board[newRow][newCol] === cell) matchCount++;
            else break;
         }

         if (matchCount === winLength) {
            winner = cell;
            return;
         }
      }
   });

   if (winner) return winner;
   if (isBoardFull(board)) return "draw";
   return null;
};

/**
 * Validates the game state and input parameters before running AI logic.
 * Ensures the board structure, markup, difficulty, optional region, and last move
 * coordinates are valid. Also verifies that the game has not already finished.
 *
 * @param {string[][]} board - Square game board containing `"x"`, `"o"` or `"e"` values.
 * @param {"x" | "o"} markup - Current player's markup.
 * @param {"very_easy" | "easy" | "medium" | "hard"} hardness - AI difficulty level.
 * @param {{startColumn:number,endColumn:number,startRow:number,endRow:number}|null} [region]
 * Optional region boundaries to operate on.
 * @param {{row:number,column:number}|null} [lastMove]
 * Optional coordinates of the last move.
 *
 * @throws {TypeError} Thrown when board structure, markup, hardness, or argument types are invalid.
 * @throws {RangeError} Thrown when board size, region, or lastMove coordinates are out of range.
 * @throws {Error} Thrown when the game is already finished.
 */
const startCheck = (board, markup, hardness, region, lastMove) => {
   checkBoard(board);

   checkMarkup(markup);

   const validHardness = ["very_easy", "easy", "medium", "hard"];
   if (!validHardness.includes(hardness)) {
      throw new TypeError(
         `Invalid "hardness" value. Expected one of: ${validHardness.join(", ")}`,
      );
   }

   if (
      board.length < 3 ||
      board.length > 9 ||
      board.some((row) => row.length !== board.length)
   ) {
      throw new RangeError("Board must be square between 3x3 and 9x9.");
   }

   const boardSize = board.length;

   if (region) {
      const { startColumn, startRow, endColumn, endRow } = region;
      const validRegion =
         [startColumn, startRow, endColumn, endRow].every(
            (n) => typeof n === "number" && n >= 0 && n < boardSize,
         ) &&
         startColumn <= endColumn &&
         startRow <= endRow;

      if (!validRegion)
         throw new RangeError(`Invalid region coordinates: ${JSON.stringify(region)}`);
   }

   if (lastMove) {
      const { column, row } = lastMove;
      if (
         typeof column !== "number" ||
         typeof row !== "number" ||
         column < 0 ||
         row < 0 ||
         column >= boardSize ||
         row >= boardSize
      ) {
         throw new RangeError('Invalid "lastMove" coordinates.');
      }
   }

   const availableMoves = getAvailableMoves(board);
   const winLength = getWinLength(board);
   const winner = getWinner(board, null, winLength);

   if (availableMoves.length === 0) {
      if (winner === "draw") {
         throw new Error("Board is full — game ended in a draw.");
      }

      if (winner) {
         throw new Error(`Game already finished — winner: ${winner}`);
      }
   }
};

/**
 * Choose a random starting position from the center cells of an empty board.
 * For even board sizes one of the four center cells is selected.
 *
 * @param {string[][]} board - The game board (2D array).
 * @throws {Error} If `board` is not a non-empty 2D array or is not empty.
 * @returns {{row:number,column:number}} Chosen starting coordinates.
 */
const randomStart = (board) => {
   if (!Array.isArray(board) || board.length === 0)
      throw new Error("Board must be a non-empty 2D array");

   const size = board.length;
   if (!isBoardEmpty(board))
      throw new Error("Board already contains at least one markup");

   const center = (size - 1) / 2;

   const roundRow = Math.random() < 0.5 ? Math.floor : Math.ceil;
   const roundColumn = Math.random() < 0.5 ? Math.floor : Math.ceil;

   const row = roundRow(center);
   const column = roundColumn(center);

   return { row, column };
};

/**
 * Finds the minimal rectangular region that contains all non-empty marks.
 *
 * @param {string[][]} board - The game board (2D array).
 * @returns {{startColumn:number,endColumn:number,startRow:number,endRow:number}|null}
 * Returns the bounds of the used region, or `null` if the board is empty.
 */
const extractUsedRegion = (board) => {
   const result = {
      startColumn: Infinity,
      endColumn: -Infinity,
      startRow: Infinity,
      endRow: -Infinity,
   };

   const boardSize = board.length;

   for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < board[i].length; j++) {
         const cell = board[i][j];
         if (cell === "e") continue;

         if (i < result.startRow) result.startRow = i;
         if (i > result.endRow) result.endRow = i;
         if (j < result.startColumn) result.startColumn = j;
         if (j > result.endColumn) result.endColumn = j;
      }
   }

   if (
      result.startColumn === Infinity ||
      result.startRow === Infinity ||
      result.endColumn === -Infinity ||
      result.endRow === -Infinity
   ) {
      return null;
   }

   return result;
};

/**
 * Expands a region by a fixed padding in all directions while clamping
 * the result to board boundaries.
 *
 * @param {{startColumn:number,endColumn:number,startRow:number,endRow:number}} region
 * Region to expand.
 * @param {number} boardSize - Size of the square board.
 * @param {number} [padding=1] - Number of cells to expand on each side.
 * @returns {{startColumn:number,endColumn:number,startRow:number,endRow:number}}
 * Expanded region clamped to board bounds.
 * @throws {TypeError} Thrown when region or boardSize is invalid.
 */
const expandRegion = (region, boardSize, padding = 1) => {
   if (
      !region ||
      typeof region.startColumn !== "number" ||
      typeof region.endColumn !== "number" ||
      typeof region.startRow !== "number" ||
      typeof region.endRow !== "number"
   ) {
      throw new TypeError(
         "Invalid region object — must contain numeric startColumn, endColumn, startRow, endRow",
      );
   }

   if (typeof boardSize !== "number" || boardSize <= 0)
      throw new TypeError("Invalid boardSize: must be a positive number");

   const expanded = {
      startColumn: Math.max(0, region.startColumn - padding),
      startRow: Math.max(0, region.startRow - padding),
      endColumn: Math.min(boardSize - 1, region.endColumn + padding),
      endRow: Math.min(boardSize - 1, region.endRow + padding),
   };

   return expanded;
};

/**
 * Extract a sub-board corresponding to the provided region.
 *
 * @param {string[][]} board - The full game board.
 * @param {{startRow:number,endRow:number,startColumn:number,endColumn:number}} region - Region bounds.
 * @returns {string[][]} A new 2D array representing the sliced region.
 */
const sliceRegion = (board, region) => {
   const { startRow, endRow, startColumn, endColumn } = region;
   const subBoard = [];

   for (let row = startRow; row <= endRow; row++) {
      const subRow = [];
      for (let col = startColumn; col <= endColumn; col++) {
         subRow.push(board[row][col]);
      }
      subBoard.push(subRow);
   }

   return subBoard;
};

/**
 * Write a `subBoard` back into `board` at the specified region coordinates.
 *
 * @param {string[][]} board - The full game board to modify in-place.
 * @param {{startRow:number,startColumn:number,endRow:number,endColumn:number}} region - Destination region.
 * @param {string[][]} subBoard - The sub-board to paste; must match region size.
 * @throws {Error} If `subBoard` dimensions don't match the region.
 */
const pasteRegion = (board, region, subBoard) => {
   const { startRow, startColumn, endRow, endColumn } = region;

   if (subBoard.length !== endRow - startRow + 1)
      throw new Error("subBoard row count does not match region height");

   for (let i = 0; i < subBoard.length; i++) {
      const row = startRow + i;

      if (subBoard[i].length !== endColumn - startColumn + 1)
         throw new Error("subBoard column count does not match region width");

      for (let j = 0; j < subBoard[i].length; j++) {
         const col = startColumn + j;
         board[row][col] = subBoard[i][j];
      }
   }
};

/**
 * Return how many marks in a row are required to win, based on board size.
 * Supported board sizes: 3..9.
 *
 * @param {string[][]} board - The game board (2D array).
 * @throws {Error} If board size is not supported.
 * @returns {number} Number of marks required to win.
 */
const getWinLength = (board) => {
   switch (board.length) {
      case 3:
         return 3;
      case 4:
      case 5:
      case 6:
         return 4;
      case 7:
      case 8:
      case 9:
         return 5;
      default:
         throw new Error("Board size not supported. Use 3 to 9.");
   }
};

/**
 * Expands a region outward in any direction where a non-empty mark ('x' or 'o')
 * is found along the region border. Expansion only occurs when space remains
 * inside the board bounds.
 *
 * @param {string[][]} board - The full game board.
 * @param {{
 *   startRow: number,
 *   endRow: number,
 *   startColumn: number,
 *   endColumn: number
 * }} region - Region to check and potentially expand.
 * @returns {{
 *   startRow: number,
 *   endRow: number,
 *   startColumn: number,
 *   endColumn: number
 * }} Possibly expanded region.
 */
const expandRegionIfEdgeHasMark = (board, region) => {
   const { startRow, endRow, startColumn, endColumn } = region;
   const numRows = board.length;
   const numCols = board[0].length;

   // Create a shallow copy of the region so we can modify it safely
   const newRegion = { ...region };

   // --- Check top edge ---
   for (let col = startColumn; col <= endColumn; col++) {
      if (board[startRow][col] !== "e" && startRow > 0) {
         newRegion.startRow = startRow - 1;
         break;
      }
   }

   // --- Check bottom edge ---
   for (let col = startColumn; col <= endColumn; col++) {
      if (board[endRow][col] !== "e" && endRow < numRows - 1) {
         newRegion.endRow = endRow + 1;
         break;
      }
   }

   // --- Check left edge ---
   for (let row = startRow; row <= endRow; row++) {
      if (board[row][startColumn] !== "e" && startColumn > 0) {
         newRegion.startColumn = startColumn - 1;
         break;
      }
   }

   // --- Check right edge ---
   for (let row = startRow; row <= endRow; row++) {
      if (board[row][endColumn] !== "e" && endColumn < numCols - 1) {
         newRegion.endColumn = endColumn + 1;
         break;
      }
   }

   return newRegion;
};

export default {
   getNextMarkup,
   isBoardEmpty,
   isEmptyField,
   isBoardFull,
   getWinLength,
   getWinner,
   getAvailableMoves,
   expandRegionIfEdgeHasMark,
   extractUsedRegion,
   forEachCellInRegion,
   startCheck,
   randomStart,
   expandRegion,
   sliceRegion,
   pasteRegion,
   getRelevantAvailableMoves,
   orderAvailableMoves,
};
