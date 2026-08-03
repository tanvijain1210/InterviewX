import express from 'express'
import isAuth from '../middlewares/isAuth.js';
import getCurrentUser from '../controllers/user.controller.js';

const UserRouter= express.Router();

UserRouter.get('/current-user', isAuth, getCurrentUser);


export default UserRouter;