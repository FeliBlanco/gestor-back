const clientPS = require("../../db")

const getProjects = (req, res) => {
    clientPS
    .query(`SELECT * FROM proyectos`)
    .then(response => {
        res.send(response.rows)
    })
    .catch(err => {
        console.log(err)
        res.status(503).send()
    })
}

module.exports = getProjects;