import Connection from "./database-connection.model.js";
import { DataTypes } from "sequelize";

/**
 * Game model representing a single game session.
 * Each game belongs to a user and stores its current state.
 */
const Game = Connection.define("Game", {
   // Unique identifier for the game
   gameId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
   },

   // 2D array representing the game board
   board: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [[]],
   },

   // Last move played, stored as { row, column }
   lastMove: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
   },

   // Current status of the game (not started, in progress, won, lost, draw)
   status: {
      type: DataTypes.ENUM("NOT_STARTED", "IN_PROGRESS", "WON", "LOST", "DRAW"),
      defaultValue: "not_started",
      allowNull: false,
   },

   // Foreign key to the User who owns this game
   userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
         model: "Users",
         key: "userId",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
   },
});

export default Game;
