const clientPS = require("../../db");

const getMiembros = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await clientPS.query(`SELECT U.id, U.username, M.fecha FROM miembros_proyectos M INNER JOIN usuarios U ON U.id = M.user_id WHERE M.project_id = $1`, [id])
        if(res) res.send(response.rows)
    }
    catch(err) {
        console.log(err)
        if(res) res.status(503).send()
    }
}

module.exports = getMiembros;