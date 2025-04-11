const clientPS = require("../../db");

const getDatabases = async (req, res) => {
    try {
        const id = req.params.id;

        const response = await clientPS.query(`SELECT DB.nombre, DB.id, G.database_name, G.database_password, G.* FROM databases DB INNER JOIN proyectos P ON P.id = DB.proyecto_id INNER JOIN grupos G ON G.id = P.grupo WHERE DB.proyecto_id = $1`, [id]);

        console.log(response.rows[0])
        res.send(response.rows)
    }
    catch(err) {
        res.status(503).send()
    }
}

module.exports = getDatabases;