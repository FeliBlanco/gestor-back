const { Router } = require('express');
const login = require('./login');
const getData = require('./getData');
const isLogged = require('../../utils/verifyToken');
const updatePassword = require('./updatePassword');
const searchUser = require('./searchUser');

const app = Router();



app.post('/login', login)
app.get('/user_data', isLogged, getData)
app.post('/change_password', isLogged, updatePassword)
app.get('/search', isLogged, searchUser);

module.exports = app;