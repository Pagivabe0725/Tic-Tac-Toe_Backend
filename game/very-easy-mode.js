import helperFunctions from "./helper.function";



function veryEasyMove(board) {

  if (helperFunctions.getAvailableMoves(board).length === 0)
    throw new Error('No available moves');

  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  const [x, y] = availableMoves[randomIndex];

  return { x, y };
}
