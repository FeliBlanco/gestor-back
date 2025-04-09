const { Router } = require('express');
const getGroups = require('./getGroups');
const createGroup = require('./createGroup');
const getGroup = require('./getGroup');
const deleteGroup = require('./deleteGroup');
const isLogged = require('../../utils/verifyToken');

const app = Router();

app.get('/:grupo', getGroup)
app.delete('/:id', deleteGroup)
app.get('/', isLogged, getGroups)
app.post('/', createGroup)

module.exports = app;