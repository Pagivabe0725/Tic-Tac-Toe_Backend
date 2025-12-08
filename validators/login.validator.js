import { body, validationResult } from "express-validator";
import DATABASE from "../database/database.js";

/**
 * Validator middleware array for user login requests.
 * Validates `email` and `password` fields and verifies that the email
 * exists in the database. On validation failure the final middleware
 * passes an Error to `next()` with `statusCode = 422` and `data` containing
 * the validation errors array.
 *
 * Usage:
 * app.post('/login', LoginValidator, loginHandler)
 *
 * @type {import('express').RequestHandler[]}
 */
const LoginValidator = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value) => {
      return DATABASE.isUsedEmail(value).then((exists) => {
        if (!exists) {
          return Promise.reject("Email not found!");
        }
      });
    }),
  body("password")
  .trim()
  .isLength({ min: 5 })
  .withMessage('Short password!'),
  /**
   * Final middleware that checks the accumulated validation result and
   * forwards an error to `next()` when validation fails.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error= new Error("Validation failed!");
      error.statusCode = 422;
      error.data = errors.array();
      return next(error);
    }
    next();
  },
];

export default LoginValidator