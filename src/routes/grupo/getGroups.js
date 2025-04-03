const clientPS = require("../../db");

const getGroups = async (req, res) => {
    try {
        const result = await clientPS.query(`SELECT *, (select count(id) FROM proyectos WHERE grupo = grupos.id) AS cantidadProyectos FROM grupos`, []);
        res.send(result.rows)
    }
    catch(err) {
        res.status(503).send()
    }
}

module.exports = getGroups;