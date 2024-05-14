const express=require('express');
const Router = express.Router();
const UserController=require('../controller/UserController');

Router.post('/register-user/:messageId',UserController.register);
Router.post('/login-user/:email',UserController.Login);

module.exports=Router;