const clientPS = require("../../db");
const execAsync = require("../../utils/execAsync");

const deleteDatabase = async (req, res) => {
    try {
        const id = req.params.id;
        
        const dabataseData = await clientPS.query(`SELECT * FROM databases WHERE id = $1`, [id])
        if(dabataseData.rowCount == 0) return res.status(404).send("database not found")
        let db_data = dabataseData.rows[0];

        await clientPS.query(`DELETE FROM databases WHERE id = $1`, [id])

        console.log("ELIMINAR DB ", db_data.nombre)
        const [err, stdout, stderr] = await execAsync(`PGPASSWORD="${process.env.DB_ROOT_PASSWORD}" psql -U ${process.env.DB_ROOT_USER} -c "DROP DATABASE ${db_data.nombre};"`)
        if(err) {
            console.log("ERROR")
            console.log(err)
        }

        res.send()
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = deleteDatabase;