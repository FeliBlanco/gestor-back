const clientPS = require("../../db");

const getProjectByGroupAndProjectId = async (req, res) => {
    const proyecto = req.params.proyecto;
    const grupo = req.params.grupo;
    try {
        const grupoData = await clientPS.query(`SELECT * FROM grupos WHERE usuario = $1`, [grupo])
        if(grupoData.rowCount == 0) return res.status(404).send()

        const result = await clientPS.query(`SELECT * FROM proyectos WHERE usuario = $1 AND grupo = $2`, [proyecto, grupoData.rows[0].id])
        if(result.rowCount == 0) return res.status(404).send()
        res.send(result.rows[0])
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = getProjectByGroupAndProjectId;