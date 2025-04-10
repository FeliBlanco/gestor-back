const clientPS = require("../../db");

const sacarMiembro = async (req, res) => {
    try {
        const proyecto = req.params.proyecto;
        const miembro_id = req.params.miembro_id;

        await clientPS.query(`DELETE FROM miembros_proyectos WHERE user_id = $1 AND project_id = $2`, [miembro_id, proyecto])
        res.send()
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = sacarMiembro;