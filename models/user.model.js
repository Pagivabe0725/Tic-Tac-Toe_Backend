import Connection from "./database-connection.model.js";
import { DataTypes } from "sequelize";

/**
 * User model representing a registered user.
 * Stores login credentials and game statistics.
 */
const User = Connection.define("User", {
   // Unique identifier for the user
   userId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
   },

   // User's email, must be unique
   email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
   },

   // Hashed password for authentication
   password: {
      type: DataTypes.STRING,
      allowNull: false,
   },

   // Total number of games the user has won
   winNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
   },

   // Total number of games the user has lost
   loseNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
   },
   
   // Total number of saved games created by the user
   game_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
   },
});

export default User;
