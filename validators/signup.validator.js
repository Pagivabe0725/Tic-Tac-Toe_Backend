import { body, validationResult } from "express-validator";
import DATABASE from "../database/database.js"

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
