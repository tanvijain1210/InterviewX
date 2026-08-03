import express from 'express'
import { googleAuth, logOut } from '../controllers/auth.controller.js';

const AuthRouter= express.Router();

AuthRouter.post('/googleAuth', googleAuth);
AuthRouter.get('/logout', logOut);

export default AuthRouter;