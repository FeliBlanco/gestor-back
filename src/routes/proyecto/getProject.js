const clientPS = require("../../db");
const { exec } = require('child_process')

const getProjectByGroupAndProjectId = async (req, res) => {
    const proyecto = req.params.proyecto;
    const grupo = req.params.grupo;
    try {
        const grupoData = await clientPS.query(`SELECT * FROM grupos WHERE usuario = $1`, [grupo])
        if(grupoData.rowCount == 0) return res.status(404).send()

        const result = await clientPS.query(`
            SELECT 
                P.*,
                D.dominio AS dominio,
                FW.tipo AS framework_tipo,
                FW.nombre AS framework_nombre
            FROM 
                proyectos P 
            LEFT JOIN 
                dominios D 
            ON 
                D.proyecto_id = P.id 
            LEFT JOIN 
                frameworks FW
            ON
                FW.id = P.framework
            WHERE 
                P.usuario = $1 AND 
                P.grupo = $2 
            LIMIT 1
        `, [proyecto, grupoData.rows[0].id])
        if(result.rowCount == 0) return res.status(404).send()

            let status = "stopped";

            exec(`docker inspect ${result.rows[0].proyect_directory.toLowerCase()}`, async (error, stdout, stderr) => {
                if(stdout) {
                    try {
                        const data_docker = JSON.parse(stdout)
                        status = data_docker[0].State.Status;
                    }
                    catch(err) {

                    }
                }
                if(result.rows[0].status != status) {
                    await clientPS.query(`UPDATE proyectos SET status = $1 WHERE id = $2`, [status, result.rows[0].id])
                }
                res.send({
                    ...result.rows[0],
                    status
                })
            })
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = getProjectByGroupAndProjectId;