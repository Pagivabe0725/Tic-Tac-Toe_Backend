//import { Sequelize } from "sequelize";

import User from "../models/user.model.js";
import Game from "../models/game.model.js";
import bcrypt from "bcrypt"; // for password hashing
import { nanoid } from "nanoid"; // for generating unique IDs

const saltRounds = 12; // bcrypt salt complexity

// Define relations between models
User.hasMany(Game, { foreignKey: "userId" });
Game.belongsTo(User, { foreignKey: "userId" });

/**
 * Checks if the email is already used in the database
 * @param {string} email
 * @returns {Promise<boolean>} true if email exists, false otherwise
 */
async function isUsedEmail(email) {
   if (typeof email !== "string") {
      throw new Error(`Invalid email: (${email}) type`);
   }

   const actualUser = await User.findOne({ where: { email } });
   return !!actualUser;
}

/**
 * Checks if a user exists in the database by userId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function isExistUser(userId) {
   if (typeof userId !== "string") {
      throw new Error(`Invalid userId: (${userId}) type`);
   }
   const actualUser = await User.findOne({ where: { userId } });
   return !!actualUser;
}

/**
 * Retrieves a user by userId and ensures the user exists
 * @param {string} userId
 * @returns {Promise<User>}
 */
async function getUserByidentifier(userId) {
   if (typeof userId !== "string") {
      throw new Error(`Invalid userId: ${userId} type`);
   }

   if (!isExistUser(userId)) {
      throw new Error(`The given userId (${userId}) does not match any existing user`);
   }

   const actualUser = await User.findOne({ where: { userId } });
   return actualUser;
}

/**
 * Creates a new user with hashed password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
async function userCreator(email, password) {
   if (typeof email !== "string") throw new Error(`Invalid email: (${email}) type`);
   if (typeof password !== "string") throw new Error(`Invalid password type`);

   const emailUsed = await isUsedEmail(email);

   if (!emailUsed) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return await User.create({
         userId: nanoid(),
         email,
         password: hashedPassword,
      });
   } else {
      throw new Error("This email is already used");
   }
}

/**
 * Authenticates a user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
async function authenticateUser(email, password) {
   if (typeof email !== "string") throw new Error(`Invalid email: (${email}) type`);
   if (typeof password !== "string") throw new Error(`Invalid password type`);

   const actualUser = await User.findOne({ where: { email } });
   if (!actualUser) {
      throw new Error(`The given email: (${email}) does not match any existing user`);
   }

   const doMatch = await bcrypt.compare(password, actualUser.password);

   if (doMatch) {
      return actualUser;
   } else {
      throw new Error(`Invalid email: (${email}) or password`);
   }
}

/**
 * Creates a new game for a user
 * @param {string} userId
 * @param {array} board optional 2D array of strings representing the board
 * @param {object} lastMove optional object {row, column} for last move
 * @param {string} status optional game status ("NOT_STARTED", "IN_PROGRESS", etc.)
 * @returns {Promise<Game>}
 */
async function gameCreator(userId, board, lastMove, status) {
   if (typeof userId !== "string") {
      throw new Error(`Invalid userId: (${userId})`);
   }

   if (board && !Array.isArray(board)) {
      throw new Error(`Invalid type: board (${board}) must be a 2D array of strings`);
   }

   if (lastMove) {
      if (
         typeof lastMove !== "object" ||
         typeof lastMove.row !== "number" ||
         typeof lastMove.column !== "number"
      ) {
         throw new Error(
            `Invalid type: lastMove (${lastMove}) must be an object with numeric 'row' (currently: ${lastMove.row}), 'column' (currently: ${lastMove.column})`
         );
      }
   }

   if (status && typeof status !== "string") {
      throw new Error(
         `Invalid type: status (${status}) must be one of ("NOT_STARTED", "IN_PROGRESS", "WON", "LOST", "DRAW")`
      );
   }

   const userExists = await isExistUser(userId);
   if (!userExists) {
      throw new Error(`The given userId: (${userId}) does not match any existing user`);
   }

   // Use conditional object properties with spread operator
   const properties = {
      gameId: nanoid(),
      userId,
      step: 0,
      ...(board && { board }),
      ...(lastMove && { lastMove }),
      ...(status && { status }),
   };

   const newGame = await Game.create(properties);

   return newGame;
}

/**
 * Updates a user's fields (email, win/lose counts)
 * @param {string} userId
 * @param {string} email optional
 * @param {number} winNumber optional
 * @param {number} loseNumber optional
 * @returns {Promise<User>}
 */
async function updateUser(userId, email, winNumber, loseNumber) {
   if (typeof userId !== "string") throw new Error(`Invalid userId: (${userId})`);
   if (email && typeof email !== "string") throw new Error(`Invalid email: (${email})`);
   if (winNumber !== undefined && typeof winNumber !== "number") throw new Error(`Invalid winNumber: ${winNumber}`);
   if (loseNumber !== undefined && typeof loseNumber !== "number") throw new Error(`Invalid loseNumber: ${loseNumber}`);

   try {
      const user = await getUserByidentifier(userId);
      if (!user) throw new Error(`No user found with the given userId: (${userId})`);

      const updatedFields = {};
      if (email) updatedFields.email = email;
      if (winNumber !== undefined) updatedFields.winNumber = winNumber;
      if (loseNumber !== undefined) updatedFields.loseNumber = loseNumber;

      await user.update(updatedFields);
      return user;
   } catch (error) {
      throw new Error(error.message || "User update failed");
   }
}

/**
 * Retrieves a game by its ID
 * @param {string} gameId
 * @returns {Promise<Game>}
 */
async function getGameById(gameId) {
   if (typeof gameId !== "string") throw new Error(`Invalid gameId: (${gameId}) type`);

   const game = await Game.findOne({ where: { gameId } });

   if (!game) throw new Error(`Not found any game with given gameId: (${gameId})`);

   return game;
}

/**
 * Retrieves paginated games for a user
 * @param {string} userId
 * @param {number} page page number
 * @param {string} order "ASC" or "DESC"
 * @returns {Promise<{count:number, rows:Game[]}>}
 */
async function getGamesByUserID(userId, page=1, order = "DESC") {
   if (typeof userId !== "string") throw new Error(`Invalid userId: (${userId}) type`);

   const safePage = Math.max(page, 1);
   const limit = 10;
   const offset = (safePage - 1) * limit;

   const games = await Game.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [["createdAt", order]],
   });

   if (games.rows.length === 0) throw new Error(`No games found for the given userId: (${userId})`);

   return games;
}

/**
 * Deletes a game if it belongs to the given user
 * @param {string} userId
 * @param {string} gameId
 * @returns {Promise<Game>} returns deleted game's data
 */
async function deleteGame(userId, gameId) {
   if (typeof userId !== "string") throw new Error(`Invalid userId: ${userId} type`);
   if (typeof gameId !== "string") throw new Error(`Invalid gameId: (${gameId}) type`);

   const game = await Game.findOne({ where: { gameId } });
   if (!game) throw new Error(`No games found for the given gameId: (${gameId})`);
   if (game.dataValues?.userId !== userId) throw new Error(`userId: (${userId}) does not match the game's owner.`);

   const copiedGame = game.dataValues;
   await game.destroy();

   return copiedGame;
}

/**
 * Updates a game's last move, board or status
 * @param {string} gameId
 * @param {object} lastMove optional
 * @param {array} board optional
 * @param {string} status optional
 * @returns {Promise<Game>}
 */
async function updateGame(gameId, lastMove, board, status) {
   if (typeof gameId !== "string") throw new Error(`Invalid gameId : ${gameId} type`);

   const game = await Game.findOne({ where: { gameId } });
   if (!game) throw new Error(`gameId: (${gameId}) does not match with any existing game`);

   await game.update({
      ...(lastMove && { lastMove }),
      ...(board && { board }),
      ...(status && { status }),
   });

   return game;
}

export default {
   userCreator,
   gameCreator,
   authenticateUser,
   getUserByidentifier,
   isUsedEmail,
   updateUser,
   getGameById,
   getGamesByUserID,
   deleteGame,
   updateGame,
};
