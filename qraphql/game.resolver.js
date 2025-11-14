import DATABASE from "../database/database.js";
import aiMove from "../game/game.js";
import helperFunction from "../game/helper.function.js";

/**
 * Creates a new game for a user.
 * @param {Object} args - Arguments object
 * @param {string} args.userId - ID of the user creating the game
 * @param {Array<Array<string>>} args.board - Initial board state
 * @param {Object} [args.lastMove] - Optional last move ({ row: number, column: number })
 * @param {string} [args.status] - Optional game status
 * @returns {Object} The created game object
 * @throws Will throw an error if creation fails
 */
const createGame = async (args) => {
   const { userId, board, lastMove, status } = args;

   try {
      const game = await DATABASE.gameCreator(userId, board, lastMove, status);
      return game?.dataValues ?? game;
   } catch (error) {
      throw new Error(error.message || "Unknown error while creating game");
   }
};

/**
 * Fetches a game by its ID.
 * @param {Object} args - Arguments object
 * @param {string} args.gameId - ID of the game to fetch
 * @returns {Object} The fetched game object
 * @throws Will throw an error if game is not found or fetch fails
 */
const getGameByGameId = async (args) => {
   const { gameId } = args;
   try {
      const game = await DATABASE.getGameById(gameId);
      return game?.dataValues ?? game;
   } catch (error) {
      throw new Error(error.message || "Unknown error while fetching game");
   }
};

/**
 * Fetches all games for a specific user with pagination.
 * @param {Object} args - Arguments object
 * @param {string} args.userId - ID of the user
 * @param {number} args.page - Page number (for pagination)
 * @param {string} [args.order] - Optional order ('ASC' or 'DESC')
 * @returns {Array<Object>} List of game objects
 * @throws Will throw an error if fetching fails
 */
const getGamesByUserId = async (args) => {
   const { userId, page, order } = args;
   try {
      const games = await DATABASE.getGamesByUserID(userId, page, order);
      const rows = games.rows;
      return rows.map(game => game.dataValues);
   } catch (error) {
      throw new Error(error.message || "Unknown error while fetching games");
   }
};

/**
 * Deletes a game for a specific user.
 * @param {Object} args - Arguments object
 * @param {string} args.userId - ID of the user
 * @param {string} args.gameId - ID of the game to delete
 * @returns {Object} The deleted game object
 * @throws Will throw an error if deletion fails
 */
const deleteGame = async (args) => {
   const { userId, gameId } = args;
   try {
      const game = await DATABASE.deleteGame(userId, gameId);
      return game;
   } catch (error) {
      throw new Error(error.message || "Unknown error while deleting game");
   }
};

/**
 * Updates an existing game.
 * @param {Object} args - Arguments object
 * @param {string} args.gameId - ID of the game to update
 * @param {string} [args.status] - Optional new status
 * @param {Array<Array<string>>} [args.board] - Optional new board state
 * @param {Object} [args.lastMove] - Optional new last move ({ row: number, column: number })
 * @returns {Object} The updated game object
 * @throws Will throw an error if update fails
 */
const updateGame = async (args) => {
   const { gameId, status, board, lastMove } = args;
   try {
      const game = await DATABASE.updateGame(gameId, lastMove, board, status);
      return game;
   } catch (error) {
      throw new Error(error.message || "Unknown error while updating game");
   }
};

/**
 * Computes the next AI move for the current board state.
 * @param {Object} args - Arguments object
 * @param {Array<Array<string>>} args.board - Current board state
 * @param {Object} [args.lastMove] - Optional last move ({ row: number, column: number })
 * @param {string} args.markup - AI's markup ('x' or 'o')
 * @param {string} args.hardness - AI difficulty level ('very_easy', 'easy', 'medium', 'hard')
 * @returns {Object} The AI move result (board, lastMove, winner, region)
 * @throws Will throw an error if AI computation fails
 */
const getAiMove = (args) => {
   const { board, lastMove, markup, hardness } = args;

   try {
      return aiMove(board, markup, hardness, lastMove);
   } catch (error) {
      throw new Error(error.message || "Unknown error while calculating AI move");
   }
};

/**
 * Checks the current board state for a winner.
 * @param {Object} args - Arguments object
 * @param {Array<Array<string>>} args.board - Current board state
 * @returns {string|null} Winner ('x', 'o', 'draw') or null if no winner
 * @throws Will throw an error if calculation fails
 */
const checkBoard = (args) => {
   const { board } = args;
   try {
      return helperFunction.getWinner(board);
   } catch (error) {
      throw new Error(error.message || "Unknown error while calculating winner");
   }
};

/**
 * GraphQL resolvers mapping
 * Maps GraphQL queries and mutations to the corresponding functions.
 */
const gameResolvers = {
   createGame_graphql: createGame,
   getGameById_graphql: getGameByGameId,
   getGamesByUserId_graphql: getGamesByUserId,
   deleteGame_graphql: deleteGame,
   updateGame_graphql: updateGame,
   aiMove_graphql: getAiMove,
   checkBoard_graphql: checkBoard,
};

export default gameResolvers;
