/* 
Expected request body for aiMoveController:
{
    board: string[][],
    markup: 'x' | 'o',
    hardness: 'very-easy' | 'easy' | 'medium' | 'hard',
    lastMove?: { row: number, column: number }
}
*/

import aiMove from "../game/game.js";
import helperFunctions from "../game/helper.function.js";
import DATABASE from "../database/database.js";

/**
 * Generate the AI's next move based on the current board state,
 * the player's markup, and the selected difficulty level.
 * lastMove is optional – null indicates no previous move.
 */
const aiMoveController = (req, res, next) => {
   const { board, lastMove, markup, hardness } = req.body;

   try {
      const result = aiMove(board, markup, hardness, lastMove || null);
      res.status(200).send(result);
   } catch (error) {
      next(error);
   }
};

/**
 * Check if the current board already has a winner.
 * The win length is dynamically computed based on board size.
 */
const checkWinner = (req, res, next) => {
   const { board } = req.body;

   // Basic validation
   if (!board) {
      return next(new Error("Invalid request body"));
   }

   try {
      const winLength = helperFunctions.getWinLength(board);
      const result = helperFunctions.getWinner(board, null, winLength);

      res.status(200).json({
         winner: result || null, // Return null when there's no winner
      });
   } catch (error) {
      next(error);
   }
};

/**
 * Fetch a single game from the database using its unique ID.
 */
const getGameById = async (req, res, next) => {
   const { gameId } = req.body;

   try {
      const game = await DATABASE.getGameById(gameId);
      res.status(200).json({ ...game.dataValues });
   } catch (error) {
      next(error);
   }
};

/**
 * Fetch multiple games belonging to a specific user.
 * Pagination and sorting are both supported.
 */
const getGamesByUserId = async (req, res, next) => {
   const { userId, page, order } = req.body;

   try {
      const games = await DATABASE.getGamesByUserID(userId, page, order);
      res.status(200).json(games);
   } catch (error) {
      next(error);
   }
};

/**
 * Update an existing game's stored state:
 * - lastMove: most recent move coordinates
 * - board: updated game board array
 * - status: updated game status (IN_PROGRESS, WON, etc.)
 */
const updateGame = async (req, res, next) => {
   const { gameId, lastMove, board, status } = req.body;

   try {
      const game = await DATABASE.updateGame(gameId, lastMove, board, status);
      res.status(200).json({ ...game });
   } catch (error) {
      next(error);
   }
};

/**
 * Delete a specific game belonging to a user.
 * Both gameId and userId are required to ensure permission.
 */
const deleteGame = async (req, res, next) => {
   const { gameId, userId } = req.body;

   try {
      const game = await DATABASE.deleteGame(userId, gameId);
      res.status(200).json({ ...game });
   } catch (error) {
      next(error);
   }
};

/**
 * Creates a new game.
 * 
 * Accepts game-related data from the request body, delegates the creation
 * process to the database layer, and returns the created game object.
 * 
 * This endpoint is responsible for initializing a new game session,
 * including board state, difficulty, opponent type, and game metadata.
 */
const createGame = async (req, res, next) => {
   const { userId, name, board, lastMove, status, difficulty, opponent, size } = req.body;

   try {
      // Create a new game entry in the database
      const game = await DATABASE.gameCreator(
         userId,
         name,
         board,
         lastMove,
         status,
         difficulty,
         opponent,
         size
      );

      // Return the created game data to the client
      res.status(200).json({ ...game.dataValues });
   } catch (error) {
      // Forward any unexpected errors to the global error handler
      next(error);
   }
};

export default {
   aiMoveController,
   checkWinner,
   getGameById,
   getGamesByUserId,
   updateGame,
   deleteGame,
   createGame,
};
