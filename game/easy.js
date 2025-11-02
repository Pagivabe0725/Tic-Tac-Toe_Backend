import helperFunctions from "./helper.function";

function easyMove(board, lastMove) {
  const availableMoves = helperFunctions.getAvailableMoves(board);

  if (availableMoves.length === 0)
    throw new Error('No available moves');

  if (!lastMove)
    return veryEasyMove(board);

  const { xCoordinate, yCoordinate } = lastMove;
  const neighbors = availableMoves.filter(([x, y]) => (
    Math.abs(x - xCoordinate) <= 1 && Math.abs(y - yCoordinate) <= 1
  ));

  const moves = neighbors.length > 0 ? neighbors : availableMoves;
  const randomIndex = Math.floor(Math.random() * moves.length);
  const [x, y] = moves[randomIndex];

  return { x, y };
}
