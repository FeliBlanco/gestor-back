const clientPS = require("../../db");
const { exec } = require('child_process')

const getProjectByGroupAndProjectId = async (req, res) => {
    const proyecto = req.params.proyecto;
    const grupo = req.params.grupo;
    try {
        const grupoData = await clientPS.query(`SELECT * FROM grupos WHERE usuario = $1`, [grupo])
        if(grupoData.rowCount == 0) return res.status(404).send()

        const result = await clientPS.query(`SELECT P.*, D.dominio AS dominio FROM proyectos P LEFT JOIN dominios D ON D.proyecto_id = P.id WHERE P.usuario = $1 AND P.grupo = $2 LIMIT 1`, [proyecto, grupoData.rows[0].id])
        if(result.rowCount == 0) return res.status(404).send()

            exec(`docker inspect ${result.rows[0].proyect_directory.toLowerCase()}`, (error, stdout, stderr) => {
                if(stdout) {
                    console.log(stdout)
                }
            })
        res.send(result.rows[0])
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = getProjectByGroupAndProjectId;