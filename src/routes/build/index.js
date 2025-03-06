const { Router } = require('express');
const getBuilds = require('./getBuilds');

const app = Router();

app.get('/:project', getBuilds)

module.exports = app;