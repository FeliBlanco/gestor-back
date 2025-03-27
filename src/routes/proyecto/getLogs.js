const clientPS = require("../../db");
const {createStream} = require("../../utils/streamController");


const getLogs = async (req, res) => {
    const project = req.params.proyecto;

    const proyecto = await clientPS.query(`SELECT proyect_directory FROM proyectos WHERE id = $1`, [project])
    if(proyecto.rowCount == 0) return res.status(404).send()

    createStream(project, proyecto.rows[0].proyect_directory.toLowerCase())

    res.send()
}

module.exports = getLogs;