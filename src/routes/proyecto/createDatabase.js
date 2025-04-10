const clientPS = require("../../db");
const execAsync = require("../../utils/execAsync");

const dbPass = "sULaSplavaSTouSCAuDirESat"
const dbUser = "postgres"

const createDatabase = async (req, res) => {
    const proyecto_id = req.params.id;
    try {
        const {
            nombre
        } = req.body;

        if(!nombre) return res.status(401).send()

        const grupoData = await clientPS.query(`SELECT G.* FROM proyectos P INNER JOIN grupos G ON G.id = P.grupo WHERE P.id = $1`, [proyecto_id])
        if(grupoData.rowCount == 0) return res.status(404).send("group not found")

        if(!grupoData.rows[0].database_name && !grupoData.rows[0].database_password) {
            const numero = Math.floor(Math.random() * 90000) + 10000;
            const database_name = `${grupoData.rows[0].usuario}_${numero}`
            const database_password = generatePassword(30);

            await clientPS.query(`UPDATE proyectos SET database_name = $1, database_password = $2 WHERE id = $3`, [database_name, database_password, proyecto_id])

            const [err, stdout, stderr] = await execAsync(`PGPASSWORD="${dbPass}" -U ${dbUser} -c "CREATE USER ${database_name} WITH PASSWORD '${database_password}';"`)
            if(err) {
                console.log("ERROR")
                console.log(err)
            }
        }

        await execAsync(`PGPASSWORD="${dbPass}" -U ${dbUser} -c "CREATE USER ${database_name} WITH PASSWORD '${database_password}';"`)

        await clientPS.query(`INSERT INTO databases (nombre, proyecto_id) VALUES ($1, $2)`, [nombre, proyecto_id])
        res.send()
    }
    catch(err){
        res.status(503).send()
    }
}

function generatePassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    return password;
  }

module.exports = createDatabase;