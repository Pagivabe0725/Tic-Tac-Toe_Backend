import express from 'express';
import authController from '../controllers/auth.controller.js';
import LoginValidator from '../validators/login.validator.js';
import SignupValidator from '../validators/signup.validator.js';



const router = express.Router();

router.post('/check-session', authController.checkSession);

router.post('/login', LoginValidator, authController.login);

router.post('/signup', SignupValidator, authController.signUp);

router.post('/logout', authController.logout)

export default router;