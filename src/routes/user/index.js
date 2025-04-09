const { Router } = require('express');
const login = require('./login');
const getData = require('./getData');
const isLogged = require('../../utils/verifyToken');
const updatePassword = require('./updatePassword');

const app = Router();



app.post('/login', login)
app.get('/user_data', isLogged, getData)
app.post('/change_password', isLogged, updatePassword)

module.exports = app;