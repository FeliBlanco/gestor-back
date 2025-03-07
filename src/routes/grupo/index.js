const { Router } = require('express');
const getGroups = require('./getGroups');
const createGroup = require('./createGroup');
const getGroup = require('./getGroup');

const app = Router();

app.get('/:grupo', getGroup)
app.get('/', getGroups)
app.post('/', createGroup)

module.exports = app;