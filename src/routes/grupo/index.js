const { Router } = require('express');
const getGroups = require('./getGroups');
const createGroup = require('./createGroup');

const app = Router();

app.get('/', getGroups)
app.post('/', createGroup)

module.exports = app;