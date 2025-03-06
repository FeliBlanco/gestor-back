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


/*app.get('/:grupo', (req, res) => {
    const grupo = req.params.grupo;

    clientPS.query(`SELECT * FROM grupos WHERE usuario = $1`, [grupo])
    .then(response => {
        if(response.rowCount == 1) {
            res.send(response.rows[0])
        } else {
            res.status(404).send("no encontrado")
        }
    })
    .catch(err => {
        console.log(err)
        res.status(503).send()
    })
})*/

module.exports = app;