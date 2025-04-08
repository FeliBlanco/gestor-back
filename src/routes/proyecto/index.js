const { Router } = require('express');
const createProject = require('./createProject');
const updateProject = require('./updateProject');
const getProjects = require('./getProjects');
const getProjectByGroupAndProjectId = require('./getProject');
const getGroupProjects = require('./getGroupProjects');
const buildProject = require('./buildProject');
const createDominio = require('./createDominio');
const getDominios = require('./getDominios');
const getConfig = require('./getConfig');
const getLogs = require('./getLogs');
const startSystem = require('./startSystem');
const stopSystem = require('./stopSystem');
const updateDominio = require('./updateDominio');
const deleteProject = require('./deleteProject');

const app = Router();

app.post('/', createProject) 
app.put('/:id', updateProject)
app.get('/', getProjects)

app.post('/dominio', createDominio);
app.get('/build/:id', buildProject);
app.delete('/:id', deleteProject);
app.get('/dominios/:proyecto', getDominios)
app.put('/dominios/:id', updateDominio)
app.get('/config/:proyecto', getConfig)
app.get('/logs/:proyecto', getLogs)
app.post('/start/:proyecto', startSystem)
app.post('/stop/:proyecto', stopSystem)
app.get('/:grupo/:proyecto', getProjectByGroupAndProjectId)

app.get('/:grupo', getGroupProjects)


module.exports = app;