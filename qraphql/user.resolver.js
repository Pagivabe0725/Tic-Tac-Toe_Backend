import dotenv from "dotenv";
import DATABASE from "../database/database.js";

dotenv.config({ path: "./environment/host-url.enviroment.env" });

/**
 * Resolver: Get CSRF Token
 * Fetches a CSRF token from a remote endpoint.
 *
 * @async
 * @function csfrToken
 * @returns {Promise<{csrfToken: string}>} Object containing the CSRF token.
 * @throws {Error} Throws if the fetch fails or the response is invalid.
 */
const csfrToken = async () => {
   let result;
   try {
      const response = await fetch(process.env.URL + "/csrf-token", {
         credentials: "include",
      });
      if (response.ok) {
         const json = await response.json();
         result = json.csrfToken;
      } else {
         throw new Error("Failed to fetch CSRF token");
      }
   } catch (error) {
      throw new Error(error);
   }

   return { csrfToken: result };
};

/**
 * Resolver: Get User by ID
 * Retrieves a user by their unique identifier.
 *
 * @async
 * @function getUserById
 * @param {Object} args - Resolver arguments
 * @param {string} args.id - The unique ID of the user to retrieve
 * @param {Object} _ - Unused context parameter
 * @returns {Promise<Object>} User object excluding the password
 * @throws {Error} Throws if ID is missing or user not found
 */
const getUserById = async ({ id }, _) => {
   if (!id) {
      throw new Error("Missing 'id' argument");
   }

   const user = await DATABASE.getUserByidentifier(id);

   if (!user) {
      throw new Error("No user found with the given ID");
   }

   const { password, ...result } = user.dataValues;
   return result;
};

/**
 * Resolver: Signup
 * Creates a new user with the provided email and password.
 *
 * @async
 * @function signup
 * @param {Object} args - Resolver arguments
 * @param {string} args.email - User email
 * @param {string} args.password - User password
 * @param {string} args.confirmPassword - Confirmation of the password
 * @returns {Promise<{userId: string}>} Newly created user's ID
 * @throws {Error} Throws if parameters are invalid, passwords mismatch, or creation fails
 */
const signup = async ({ email, password, confirmPassword }) => {
   if (!email || !password || !confirmPassword) {
      throw new Error("Invalid parameter list");
   }

   if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
   }

   try {
      const createdUser = await DATABASE.userCreator(email, password);

      const user = createdUser?.dataValues ?? createdUser;

      if (!user || !user.userId) {
         throw new Error("User creation failed");
      }

      return { userId: user.userId };
   } catch (error) {
      throw new Error(error.message || "Unknown signup error");
   }
};

/**
 * Resolver: Login
 * Authenticates a user and sets session variables.
 *
 * @async
 * @function login
 * @param {Object} args - Resolver arguments
 * @param {string} args.email - User email
 * @param {string} args.password - User password
 * @param {Object} context - GraphQL context containing the request object
 * @param {Object} context.req - Express request object
 * @returns {Promise<Object>} Authenticated user's dataValues
 * @throws {Error} Throws if credentials are invalid or authentication fails
 */
const login = async ({ email, password }, context) => {

   if (!email || !password) {
      throw new Error("Invalid parameter list");
   }

   try {
      const user = await DATABASE.authenticateUser(email, password);

      if (!user) {
         throw new Error("Authentication failed");
      }
      const { req } = context;
      req.session.userId = user.userId;
      req.session.userExpire = Date.now() + 1000 * 60 * 60 * 48; // 48 hours
      return user.dataValues;
   } catch (error) {
      throw new Error(error.message || "Unknown login error");
   }
};

/**
 * Resolver: Update User
 * Updates user fields with optional values.
 *
 * @async
 * @function updatedUser
 * @param {Object} args - Resolver arguments
 * @param {string} args.userId - Unique user ID
 * @param {string} [args.email] - Optional new email
 * @param {number} [args.winNumber] - Optional new win count
 * @param {number} [args.loseNumber] - Optional new lose count
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} Throws if update fails or user not found
 */
const updatedUser = async ({ userId, email, winNumber, loseNumber }) => {
   try {
      const updatedUser = await DATABASE.updateUser(userId, email, winNumber, loseNumber);
      if (!updatedUser) {
         throw new Error("Empty updatedUser object");
      }
      return updatedUser?.dataValues ?? updatedUser;
   } catch (error) {
      throw new Error(error.message || "Update failed");
   }
};

/**
 * Resolver: Logout
 * Deletes user session information.
 *
 * @async
 * @function logout
 * @param {Object} _ - Unused args parameter
 * @param {Object} context - GraphQL context containing the request object
 * @param {Object} context.req - Express request object
 * @returns {Promise<boolean>} True if logout succeeded, false if no user session exists
 * @throws {Error} Throws if session saving fails
 */
const logout = async (_, context) => {
   const { req } = context;

   if (!req.session.userId) return false;

   delete req.session.userId;
   delete req.session.userExpire;

   await new Promise((resolve, reject) => {
      req.session.save((error) => {
         if (error) reject(new Error("Session saving failed"));
         else resolve();
      });
   });

   return true;
};

/**
 * Exported GraphQL resolvers
 */
const userResolvers = {
   getCsrfToken_graphql: csfrToken,
   getUserById_graphql: getUserById,
   login_graphql: login,
   signup_graphql: signup,
   updatedUser_graphql: updatedUser,
   logout_graphql: logout,
};

export default userResolvers;
