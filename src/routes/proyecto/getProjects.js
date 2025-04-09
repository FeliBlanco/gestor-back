const clientPS = require("../../db")

const getProjects = (req, res) => {
    clientPS
    .query(`SELECT P.* FROM miembros_proyectos MP INNER JOIN proyectos P ON P.id = MP.project_id AND MP.user_id = $1`, [req.user.id])
    .then(response => {
        res.send(response.rows)
    })
    .catch(err => {
        console.log(err)
        res.status(503).send()
    })
}

module.exports = getProjects;