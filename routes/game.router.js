import express from "express";
import gameController from "../controllers/game.controller.js";

/**
 * Express router responsible for handling all game-related operations.
 *
 * Available endpoints:
 *  - POST /get           → Fetch a game by its ID
 *  - POST /get-all       → Fetch all games for a given user (with pagination)
 *  - POST /update-game   → Update an existing game (status, board, lastMove)
 *  - POST /delete-game   → Delete a specific game for a given user
 *  - POST /ai-move       → Let the AI compute its next move
 *  - POST /check-board   → Evaluate a board and check if there's a winner
 */

const router = express.Router();

/**
 * POST /get
 * Request body: 
 *    { gameId: string }
 * Response: Game object
 */
router.post("/get", gameController.getGameById);

/**
 * POST /get-all
 * Request body: 
 *    { userId: string, page: number, order: "ASC"|"DESC" }
 * Response: { rows: Game[], count: number }
 */
router.post("/get-all", gameController.getGamesByUserId);

/**
 * POST /update-game
 * Request body: 
 *    {
 *       gameId: string,
 *       lastMove?: { row: number, column: number },
 *       board?: string[][],
 *       status?: "NOT_STARTED" | "IN_PROGRESS" | "WON" | "LOST" | "DRAW"
 *    }
 * Response: Updated Game object
 */
router.post("/update-game", gameController.updateGame);

/**
 * POST /delete-game
 * Request body: 
 *    { userId: string, gameId: string }
 * Response: Deleted Game object
 */
router.post("/delete-game", gameController.deleteGame);

/**
 * POST /ai-move
 * Request body:
 *    {
 *       board: string[][],
 *       markup: "x" | "o",
 *       hardness: "very-easy" | "easy" | "medium" | "hard",
 *       lastMove?: { row: number, column: number }
 *    }
 * Response:
 *    {
 *       board: string[][],
 *       lastMove: { row: number, column: number },
 *       winner: string | null,
 *       region?: { ... }
 *    }
 */
router.post("/ai-move", gameController.aiMoveController);

/**
 * POST /check-board
 * Request body: 
 *    { board: string[][] }
 * Response: 
 *    { winner: "x" | "o" | "draw" | null }
 */
router.post("/check-board", gameController.checkWinner);

export default router;
