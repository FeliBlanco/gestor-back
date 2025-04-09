const { Router } = require('express');
const login = require('./login');
const getData = require('./getData');
const isLogged = require('../../utils/verifyToken');

const app = Router();



app.post('/login', login)
app.get('/user_data', isLogged, getData)

module.exports = app;