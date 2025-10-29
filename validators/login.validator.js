import { body, validationResult } from "express-validator";
import DATABASE from "../database/database.js";

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