import DATABASE from "../database/database.js";

/**
 * Handles user signup.
 * Validates email and password types, creates a new user in the database,
 * and returns the new user's ID.
 */
const signUp = async (req, res, next) => {
   const { email, password } = req.body;

   try {
      if (typeof email !== "string") {
         throw new Error(`Invalid email: (${email}) type`);
      }

      if (typeof password !== "string") {
         throw new Error(`Invalid password type`);
      }

      const newUser = await DATABASE.userCreator(email, password);
      return res.status(201).json({ userId: newUser.dataValues.userId });
   } catch (error) {
      error.statusCode = 400;
      return next(error);
   }
};

/**
 * Checks if the current session is valid.
 * Returns the user data (excluding password) if the session is active.
 * Throws an error if the session is not valid.
 */
const checkSession = async (req, res, next) => {
   const { userId } = req.session;

   if (!userId) {
      const error = new Error("User is not logged in!");
      error.statusCode = 401;
      return next(error);
   }

   try {
      const user = await DATABASE.getUserByidentifier(userId);
      const { password, ...result } = user.dataValues;
      return res.json({ user: result });
   } catch (error) {
      if (!error.statusCode) {
         error.statusCode = 500;
      }
      next(error);
   }
};

/**
 * Authenticates a user with email and password.
 * Sets userId and userExpire in session for 48 hours on success.
 */
const login = async (req, res, next) => {
   const { email, password } = req.body;

   try {
      if (typeof email !== "string") {
         throw new Error(`Invalid email: (${email}) type`);
      }

      if (typeof password !== "string") {
         throw new Error(`Invalid password type`);
      }
      const user = await DATABASE.authenticateUser(email, password);

      req.session.userId = user.userId;
      req.session.userExpire = Date.now() + 1000 * 60 * 60 * 48;
      const { password: _, ...resultUser } = user.dataValues;

      return res.status(200).json({ ...resultUser });
   } catch (error) {
      if (!error.statusCode) {
         error.statusCode = 500;
      }
      next(error);
   }
};

/**
 * Logs out the current user.
 * Clears userId and userExpire from the session.
 * Throws an error if the session does not exist or is invalid.
 */
const logout = (req, res, next) => {
   if (!req.session) {
      const error = new Error("Session does not exist");
      error.statusCode = 400;
      return next(error);
   } else if (!req.session.userId) {
      const error = new Error("Session does not contain userId");
      error.statusCode = 400;
      return next(error);
   }

   delete req.session.userId;
   delete req.session.userExpire;

   res.status(200).json({ result: true });
};

/**
 * Checks whether a given email is already used.
 * Returns true if the email exists, false otherwise.
 */
const isUsedEmail = async (req, res, next) => {
   const { email } = req.body;

   if (!email) {
      const error = new Error("Email is undefined!");
      return next(error);
   }

   const result = await DATABASE.isUsedEmail(email);
   res.status(200).json({ result: result });
};

/**
 * Updates user data: email, winNumber, loseNumber.
 * Returns the updated user object on success.
 */
const updateUser = async (req, res, next) => {
   const { userId, email, winNumber, loseNumber } = req.body;
   try {
      const updatedUser = await DATABASE.updateUser(userId, email, winNumber, loseNumber);
      if (!updatedUser) {
         throw new Error("Empty updatedUser object");
      }

      res.status(200).json({ user: updatedUser?.dataValues ?? updatedUser });
   } catch (error) {
      return next(error);
   }
};

const getUserByidentifier = async(req, res, next) => {
   const { userId } = req.body;
   try {
      const user = await DATABASE.getUserByidentifier(userId);

      if (!user) {
         throw new Error("Empty user object");
      }

      const {password, ...resultUser} = user.dataValues 

      res.status(200).json({ ...resultUser });
   } catch (error) {
      next(error);
   }
};

export default {
   signUp,
   checkSession,
   logout,
   login,
   isUsedEmail,
   updateUser,
   getUserByidentifier,
};
