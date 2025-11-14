const  getNextMarkup = (board) => {
  let x = 0;
  let o = 0;

  for (const row of board) {
    for (const cell of row) {
      if (cell === 'x') x++;
      else if (cell === 'o') o++;
    }
  }

  if (x === 0 && o === 0) return 'x';
  return x > o ? 'o' : 'x';
}

const isBoardEmpty = (board) => {
  if (!Array.isArray(board) || board.length === 0)
    throw new Error("Invalid board: must be a non-empty 2D array");
  
  return board.every(row => row.every(cell => cell === ''));
}

const isEmptyField = (board, row, col) => {
  return board[row][col] === '';
}

const isBoardFull = (board) => {
  for (const row of board) {
    for (const cell of row) {
      if (cell === '') return false;
    }
  }
  return true;
}

const getAvailableMoves = (board) => {
  const moves = [];
  board.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === '') moves.push([i, j]);
    });
  });
  return moves;
}



const forEachCellInRegion = (board, region, callback) => {
  const { startColumn, endColumn, startRow, endRow } = region;

  if (
    startColumn === undefined || endColumn === undefined ||
    startRow === undefined || endRow === undefined
  ) {
    throw new Error('Invalid region object — must contain startColumn, endColumn, startRow, endRow');
  }

  if (startColumn > endColumn || startRow > endRow) return;

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startColumn; col <= endColumn; col++) {
      callback(board[row][col], row, col);
    }
  }
}

const getWinner = (board, region = null, winLength = 3) => {
  const boardSize = board.length;

  if (!region) {
    region = {
      startColumn: 0,
      startRow: 0,
      endColumn: boardSize - 1,
      endRow: boardSize - 1
    };
  }

  const { startColumn, startRow, endColumn, endRow } = region;

  if (
    startColumn === undefined || endColumn === undefined ||
    startRow === undefined || endRow === undefined
  ) {
    throw new Error('Invalid region object — must contain startColumn, endColumn, startRow, endRow');
  }

  const width = endColumn - startColumn + 1;
  const height = endRow - startRow + 1;

  if (width < winLength || height < winLength) return null;

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  let winner = null;

  forEachCellInRegion(board, region, (cell, row, col) => {
    if (winner || cell === '') return;

    for (const [dirX, dirY] of directions) {
      let matchCount = 1;

      for (let step = 1; step < winLength; step++) {
        const newRow = row + dirX * step;
        const newCol = col + dirY * step;

        if (
          newRow < startRow || newRow > endRow ||
          newCol < startColumn || newCol > endColumn
        ) break;

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
  if (isBoardFull(board)) return 'draw';
  return null;
}

const startCheck = (board, markup, hardness, region, lastMove) => {
  if (!Array.isArray(board) || !Array.isArray(board[0])) {
    throw new TypeError('Invalid argument: "board" must be a 2D array.');
  }

  if (typeof markup !== 'string' || !['x', 'o'].includes(markup)) {
    throw new TypeError('Invalid "markup": must be "x" or "o".');
  }

  const validHardness = ['very-easy', 'easy', 'medium', 'hard'];
  if (!validHardness.includes(hardness)) {
    throw new TypeError(`Invalid "hardness" value. Expected one of: ${validHardness.join(', ')}`);
  }

  const boardSize = board.length;

  if (region) {
    const { startColumn, startRow, endColumn, endRow } = region;
    const validRegion =
      [startColumn, startRow, endColumn, endRow].every(
        n => typeof n === 'number' && n >= 0 && n < boardSize
      ) && startColumn <= endColumn && startRow <= endRow;

    if (!validRegion) throw new RangeError('Invalid region coordinates.');
  }

  if (lastMove) {
    const { column, row } = lastMove;
    if (
      typeof column !== 'number' ||
      typeof row !== 'number' ||
      column < 0 ||
      row < 0 ||
      column >= boardSize ||
      row >= boardSize
    ) {
      throw new RangeError('Invalid "lastMove" coordinates.');
    }
  }

  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0 && !getWinner(board,null,getWinLength(board))) {
    throw new Error('No available moves — board is full.');
  }
}

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
}

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
      if (cell === '') continue;

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
}

const expandRegion = (region, boardSize, padding = 1) => {
  if (
    !region ||
    typeof region.startColumn !== 'number' ||
    typeof region.endColumn !== 'number' ||
    typeof region.startRow !== 'number' ||
    typeof region.endRow !== 'number'
  ) {
    throw new TypeError('Invalid region object — must contain numeric startColumn, endColumn, startRow, endRow');
  }

  if (typeof boardSize !== 'number' || boardSize <= 0)
    throw new TypeError('Invalid boardSize: must be a positive number');

  const expanded = {
    startColumn: Math.max(0, region.startColumn - padding),
    startRow: Math.max(0, region.startRow - padding),
    endColumn: Math.min(boardSize - 1, region.endColumn + padding),
    endRow: Math.min(boardSize - 1, region.endRow + padding),
  };

  return expanded;
}

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
}

const pasteRegion = (board, region, subBoard) => {
  const { startRow, startColumn, endRow, endColumn } = region;

  if (subBoard.length !== (endRow - startRow + 1))
    throw new Error('subBoard row count does not match region height');

  for (let i = 0; i < subBoard.length; i++) {
    const row = startRow + i;

    if (subBoard[i].length !== (endColumn - startColumn + 1))
      throw new Error('subBoard column count does not match region width');

    for (let j = 0; j < subBoard[i].length; j++) {
      const col = startColumn + j;
      board[row][col] = subBoard[i][j];
    }
  }



}

const getWinLength = (board) => {
    switch (board.length) {
        case 3:
            return 3;
        case 4:
            return 3; 
        case 5:
        case 6:
            return 4;
        case 7:
            return 4; 
        case 8:
        case 9:
            return 5;
        default:
            throw new Error("Board size not supported. Use 3 to 9.");
    }
}


/**
 * Expands a region outward in any direction where a non-empty mark ('x' or 'o')
 * is found along the region's border. Expansion only occurs if there is space
 * left on the board in that direction.
 *
 * @function expandRegionIfEdgeHasMark
 * @param {string[][]} board - The full game board.
 * @param {{
 *   startRow: number,
 *   endRow: number,
 *   startColumn: number,
 *   endColumn: number
 * }} region - The current region to check and potentially expand.
 * @returns {{
 *   startRow: number,
 *   endRow: number,
 *   startColumn: number,
 *   endColumn: number
 * }} The possibly expanded region.
 *
 * @example
 * const region = { startRow: 2, endRow: 4, startColumn: 2, endColumn: 4 };
 * const newRegion = expandRegionIfEdgeHasMark(board, region);
 * console.log(newRegion);
 */
const expandRegionIfEdgeHasMark = (board, region) => {
  const { startRow, endRow, startColumn, endColumn } = region;
  const numRows = board.length;
  const numCols = board[0].length;

  // Create a shallow copy of the region so we can modify it safely
  const newRegion = { ...region };

  // --- Check top edge ---
  for (let col = startColumn; col <= endColumn; col++) {
    if (board[startRow][col] !== '' && startRow > 0) {
      newRegion.startRow = startRow - 1;
      break;
    }
  }

  // --- Check bottom edge ---
  for (let col = startColumn; col <= endColumn; col++) {
    if (board[endRow][col] !== '' && endRow < numRows - 1) {
      newRegion.endRow = endRow + 1;
      break;
    }
  }

  // --- Check left edge ---
  for (let row = startRow; row <= endRow; row++) {
    if (board[row][startColumn] !== '' && startColumn > 0) {
      newRegion.startColumn = startColumn - 1;
      break;
    }
  }

  // --- Check right edge ---
  for (let row = startRow; row <= endRow; row++) {
    if (board[row][endColumn] !== '' && endColumn < numCols - 1) {
      newRegion.endColumn = endColumn + 1;
      break;
    }
  }

  return newRegion;
}


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
};
