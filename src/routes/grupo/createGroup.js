const clientPS = require("../../db");
const { exec } = require('child_process')
const createGroup = async (req, res) => {
    try {
        if(!"nombre" in req.body) return res.status(401).send("nombre is required")
        const {
            nombre
        } = req.body;

        let usuario = nombre.replaceAll(' ', '-').toLowerCase()
        const search = await clientPS.query(`SELECT id FROM grupos where usuario = $1`, [usuario]);
        if(search.rowCount != 0) {
            usuario = `${usuario}-${search.rowCount + 1}`
        }
        await clientPS.query(`INSERT INTO grupos (nombre, creador, usuario) VALUES ($1, 'Feli Blanco', $2)`, [nombre, usuario]);

        exec(`mkdir -p ${global.URL_PROYECTOS}${usuario}`, (error, stdout, stderr) => {
            if(error) {
                console.log("ERROR AL CREAR DIRECTORIO CREAR GRUPO")
                console.log(error)
            } else {

            }
        })

        res.send()
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = createGroup;