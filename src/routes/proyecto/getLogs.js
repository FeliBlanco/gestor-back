const clientPS = require("../../db");
const { getIO } = require("../../socket");
const { createStream } = require("../../utils/streamController");


const getLogs = async (req, res) => {
    const project = req.params.proyecto;

    //createStream(project, proyecto.rows[0].proyect_directory.toLowerCase(), io)

    res.send()
}

module.exports = getLogs;