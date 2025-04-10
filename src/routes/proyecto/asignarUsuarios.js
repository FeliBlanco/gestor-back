const clientPS = require("../../db");
const getMiembros = require("./getMiembros");

const asignarUsuarios = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            usuarios
        } = req.body;

        const fecha = Date.now()
        usuarios.forEach(async usuario => {
            await clientPS.query(`INSERT INTO miembros_proyectos (user_id, project_id, fecha) VALUES ($1, $2, $3)`, [usuario, id, fecha])
        })
        getMiembros(req, res)
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = asignarUsuarios;