const clientPS = require("../../db");

const getGroupProjects = async (req, res) => {
    try {
        const grupo = await clientPS.query(`SELECT * FROM grupos WHERE usuario = $1`, [req.params.grupo]);
        if(grupo.rowCount == 0) return res.status(404).send("no")

        const proyectos = await clientPS.query(`SELECT P.*, D.dominio, F.nombre AS framework_nombre, F.tipo AS framework_tipo FROM proyectos P INNER JOIN frameworks F ON F.id = P.framework LEFT JOIN dominios D ON D.proyecto_id = P.id WHERE P.grupo = $1 ORDER BY P.id`, [grupo.rows[0].id])
        res.send(proyectos.rows)

    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = getGroupProjects;