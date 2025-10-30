import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import LoginValidator from '../validators/login.validator.js';
import SignupValidator from '../validators/signup.validator.js';
import SessionController from '../controllers/session.controller.js';

const router = express.Router();

router.post('/check-session', SessionController.heartBeat, AuthController.checkSession);

router.post('/login', LoginValidator, SessionController.heartBeat, AuthController.login);

router.post('/signup', SignupValidator, SessionController.heartBeat, AuthController.signUp);

router.post('/logout', AuthController.logout);

export default router;