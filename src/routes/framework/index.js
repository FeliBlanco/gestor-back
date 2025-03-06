const { Router } = require('express');
const getFramworks = require('./getFrameworks');

const app = Router();

app.get('/', getFramworks)


module.exports = app;