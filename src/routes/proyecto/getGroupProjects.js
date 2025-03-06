const clientPS = require("../../db");

const getGroupProjects = async (req, res) => {
    try {
        const grupo = await clientPS.query(`SELECT * FROM grupos WHERE usuario = $1`, [req.params.grupo]);
        if(grupo.rowCount == 0) return res.status(404).send("no")
        const proyectos = await clientPS.query(`SELECT * FROM proyectos WHERE grupo = $1`, [grupo.rows[0].id])
        res.send(proyectos.rows)

    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = getGroupProjects;