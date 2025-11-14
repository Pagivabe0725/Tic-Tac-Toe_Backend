import express from "express";
import AuthController from "../controllers/auth.controller.js";
import LoginValidator from "../validators/login.validator.js";
import SignupValidator from "../validators/signup.validator.js";
import SessionController from "../controllers/session.controller.js";

/**
 * Router for all authentication and user-related operations.
 *
 * Endpoints:
 *  - POST /check-session   → Verify if the user session is still valid
 *  - POST /login           → Authenticate a user
 *  - POST /signup          → Register a new user
 *  - POST /logout          → Log out the current user
 *  - POST /is-used-email   → Check if an email is already registered
 *  - POST /update-user     → Update user profile information
 */
const router = express.Router();

/**
 * POST /check-session
 * Check whether the session is still valid.
 * Uses heartbeat middleware to refresh expiration if needed.
 *
 * Request body: {}
 *
 * Response:
 *  { user: { userId, email, winNumber, loseNumber, createdAt, updatedAt } }
 *
 */
router.post("/check-session", SessionController.heartBeat, AuthController.checkSession);

/**
 * POST /login
 * Authenticate a user with email and password.
 * Validates input, refreshes session, then verifies credentials.
 *
 * Request body:
 *  { email: string, password: string }
 *
 * Response:
 *  { user: { userId, email, winNumber, loseNumber, createdAt, updatedAt } }
 *
 */
router.post("/login", LoginValidator, SessionController.heartBeat, AuthController.login);

/**
 * POST /signup
 * Register a new user.
 * Validates input, refreshes session, then creates the user account.
 * 
 * Request body:
 *  { email: string, password: string }
 * 
 * Response:
 *  { userId: string }
 * 
 */
router.post(
   "/signup",
   SignupValidator,
   SessionController.heartBeat,
   AuthController.signUp
);

/**
 * POST /logout
 * Logs out the currently authenticated user.
 * Clears userId and session expiration.
 *
 * Request body: {}
 *
 * Response:
 *  { result: true }
 *
 */
router.post("/logout", AuthController.logout);

/**
 * POST /is-used-email
 * Check if an email address is already registered.
 * Useful for signup pre-validation.
 *
 * Request body:
 *  { email: string }
 *
 * Response:
 *  { result: boolean }
 *
 */
router.post("/is-used-email", AuthController.isUsedEmail);

/**
 * POST /update-user
 * Update an existing user's profile information.
 * Only authenticated users or allowed users may update.
 *
 * Request body:
 *  {
 *    userId: string,
 *    email?: string,
 *    winNumber?: number,
 *    loseNumber?: number
 *  }
 *
 * Response:
 *  { user: { userId, email, winNumber, loseNumber, createdAt, updatedAt } }
 *
 */
router.post("/update-user", AuthController.updateUser);

export default router;
