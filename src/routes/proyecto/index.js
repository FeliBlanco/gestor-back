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
const isLogged = require('../../utils/verifyToken');
const getMiembros = require('./getMiembros');
const asignarUsuarios = require('./asignarUsuarios');
const sacarMiembro = require('./sacarMiembro');
const createDatabase = require('./createDatabase');
const getDatabases = require('./getDatabases');

const app = Router();

app.post('/', isLogged, createProject) 
app.put('/:id', updateProject)
app.get('/', isLogged, getProjects)

app.post('/dominio', createDominio);

app.get('/miembros/:id', isLogged, getMiembros);
app.get('/build/:id', buildProject);
app.delete('/:id', deleteProject);
app.get('/dominios/:proyecto', getDominios)
app.put('/dominios/:id', updateDominio)
app.get('/config/:proyecto', getConfig)
app.get('/logs/:proyecto', getLogs)
app.post('/start/:proyecto', startSystem)
app.post('/asignar_usuario/:id', isLogged, asignarUsuarios)
app.post('/create_database/:id', isLogged, createDatabase)
app.get('/databases/:id', isLogged, getDatabases)
app.delete('/miembro/:proyecto/:miembro_id', isLogged, sacarMiembro)
app.post('/stop/:proyecto', stopSystem)
app.get('/:grupo/:proyecto', getProjectByGroupAndProjectId)

app.get('/:grupo', getGroupProjects)


module.exports = app;