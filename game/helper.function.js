export function getNextMarkup(board) {
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

export function isEmptyField(board, row, col) {
  return board[row][col] === '';
}

export function isBoardFull(board) {

  for (const row of board) {
    for (const cell of row) {
      if (cell === '') return false;
    }
  }
  return true;
}

export function getAvailableMoves(board) {
  const moves = [];
  board.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === '') moves.push([i, j]);
    });
  });
  return moves;
}

export function extractUsedRegion(board) {
  const result = {
    startX: Infinity,
    endX: -Infinity,
    startY: Infinity,
    endY: -Infinity,
  };

  const boardSize = board.length;

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const cell = board[i][j];
      if (cell === '') continue;

      if (i < result.startY) result.startY = i;
      if (i > result.endY) result.endY = i;
      if (j < result.startX) result.startX = j;
      if (j > result.endX) result.endX = j;
    }
  }

  if (
    result.startX === Infinity ||
    result.startY === Infinity ||
    result.endX === -Infinity ||
    result.endY === -Infinity
  ) {
    return null;
  }

  return result;
}

export function forEachCellInRegion(board, region, callback) {
  const { startX, endX, startY, endY } = region;

  if (
    startX === undefined || endX === undefined ||
    startY === undefined || endY === undefined
  ) {
    throw new Error('Invalid region object — must contain startX, endX, startY, endY');
  }

  if (startX > endX || startY > endY) return;

  for (let row = startY; row <= endY; row++) {
    for (let col = startX; col <= endX; col++) {
      callback(board[row][col], row, col);
    }
  }
}

export function getWinner(board, region = null, winLength = 3) {
  const boardSize = board.length;

   if (!region) {
    region = {
      startX: 0,
      startY: 0,
      endX: boardSize - 1,
      endY: boardSize - 1
    };
  }

  const { startX, startY, endX, endY } = region;

  if (
    startX === undefined || endX === undefined ||
    startY === undefined || endY === undefined
  ) {
    throw new Error('Invalid region object — must contain startX, endX, startY, endY');
  }

  const width = endX - startX + 1;
  const height = endY - startY + 1;

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
          newRow < startY || newRow > endY ||
          newCol < startX || newCol > endX
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

function startCheck(board, markup, hardness, region, lastMove){
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
    const { startX, startY, endX, endY } = region;
    const validRegion =
      [startX, startY, endX, endY].every(
        n => typeof n === 'number' && n >= 0 && n < boardSize
      ) && startX <= endX && startY <= endY;

    if (!validRegion) throw new RangeError('Invalid region coordinates.');
  }

  if (lastMove) {
    const { xCoordinate, yCoordinate } = lastMove;
    if (
      typeof xCoordinate !== 'number' ||
      typeof yCoordinate !== 'number' ||
      xCoordinate < 0 ||
      yCoordinate < 0 ||
      xCoordinate >= boardSize ||
      yCoordinate >= boardSize
    ) {
      throw new RangeError('Invalid "lastMove" coordinates.');
    }
  }

  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) {
    throw new Error('No available moves — board is full.');
  }
}

export default {
  getNextMarkup,
  getAvailableMoves,
  isEmptyField,
  isBoardFull,
  extractUsedRegion,
  forEachCellInRegion,
  getWinner,
  startCheck
}