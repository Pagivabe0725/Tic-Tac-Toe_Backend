import { body, validationResult } from "express-validator";
import DATABASE from "../database/database.js"

/**
 * Validator middleware array for user signup requests.
 * Validates `email`, `password`, and `confirmPassword` fields and ensures
 * the email is not already in use. On validation failure the final middleware
 * passes an Error to `next()` with `statusCode = 422` and `data` containing
 * the validation errors array.
 *
 * Usage:
 * app.post('/signup', SignupValidator, signupHandler)
 *
 * @type {import('express').RequestHandler[]}
 */
const SignupValidator = [
  body('email')
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value) => {
      return DATABASE.isUsedEmail(value).then((exists) => {
        if (exists) {
          return Promise.reject('This email address is already taken!')
        }
        return true
      });
    }),

  body('password')
    .trim()
    .isLength({min:5})
    .withMessage('Short password!'),

  body('confirmPassword')
    .custom((value, {req}) => {
        const rePassword  =  req.body.password.trim()
        if(value !== rePassword){
            return Promise.reject('Passwords do not match!')
        }
         return true
    }),

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
      const error = new Error("Validation failed!");
      error.statusCode = 422;
      error.data = errors.array();
      return next(error);
    }
    next();  
  }  
]

export default SignupValidator
