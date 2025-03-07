const { Router } = require('express');
const createProject = require('./createProject');
const updateProject = require('./updateProject');
const getProjects = require('./getProjects');
const getProjectByGroupAndProjectId = require('./getProject');
const getGroupProjects = require('./getGroupProjects');
const buildProject = require('./buildProject');

const app = Router();

app.post('/', createProject) 
app.put('/:id', updateProject)
app.get('/', getProjects)

app.get('/build/:id', buildProject);
app.get('/:grupo/:proyecto', getProjectByGroupAndProjectId)

app.get('/:grupo', getGroupProjects)


module.exports = app;