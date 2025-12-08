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

   name: {
      type: DataTypes.STRING,
      allowNull: false,
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
      type: DataTypes.ENUM("not_started", "in_progress", "won", "lost", "draw"),
      defaultValue: "not_started",
      allowNull: false,
   },

   difficulty: {
      type: DataTypes.ENUM("very_easy", "easy", "medium", "hard"),
      allowNull: false,
   },

   opponent: {
      type: DataTypes.ENUM("player", "computer"),
      allowNull: false,
   },

   size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
         min: 3,
         max: 9,
      },
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
