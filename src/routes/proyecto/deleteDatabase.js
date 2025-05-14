const clientPS = require("../../db");
const execAsync = require("../../utils/execAsync");

const deleteDatabase = async (req, res) => {
    try {
        const id = req.params.id;
        
        const dabataseData = await clientPS.query(`SELECT * FROM databases WHERE id = $1`, [id])
        if(dabataseData.rowCount == 0) return res.status(404).send("database not found")
        const proyecto_id = dabataseData.rows[0].proyecto_id;

        const grupoData = await clientPS.query(`SELECT G.* FROM proyectos P INNER JOIN grupos G ON G.id = P.grupo WHERE P.id = $1`, [proyecto_id])

        await clientPS.query(`DELETE FROM databases WHERE id = $1`, [id])

        if(grupoData.rowCount > 0){
            const countDBS = await clientPS.query(`SELECT * FROM databases WHERE proyecto_id = $1`, [proyecto_id])

            if(countDBS.rowCount == 0) {
                const [err, stdout, stderr] = await execAsync(`PGPASSWORD="${process.env.DB_ROOT_PASSWORD}" psql -U ${process.env.DB_ROOT_USER} -c "DROP DATABASE ${dabataseData.rows[0].nombre};"`)
                if(err) {
                    console.log("ERROR")
                    console.log(err)
                }
                console.log("ELIMINAR DB ", grupoData.rows[0].database_name)
                await execAsync(`PGPASSWORD="${process.env.DB_ROOT_PASSWORD}" psql -U ${process.env.DB_ROOT_USER} -c "DROP DATABASE ${grupoData.rows[0].database_name};"`)
                await clientPS.query(`UPDATE grupos SET database_name = '', database_password = '' WHERE id = $1`, [grupoData.rows[0].id])
            }

        }

        res.send()
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = deleteDatabase;