const moment = require('moment')
const { exec } = require('child_process');
const clientPS = require('../../db');


const getDominios = async (req, res) => {
    try {
        const proyecto = req.params.proyecto;
        const searchProyecto = await clientPS.query(`SELECT * FROM dominios WHERE proyecto_id = $1`, [proyecto])

        res.send(searchProyecto.rows)
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = getDominios;