const moment = require('moment')
const { exec } = require('child_process');
const clientPS = require('../../db');
const fs = require('fs')
const path = require('path')


const createDominio = async (req, res) => {
    try {
        if(!"dominio" in req.body) return res.status(401).send("dominio is required.")
        if(!"configuraciones" in req.body) return res.status(401).send("configuraciones is required.")
        if(!"proyecto_id" in req.body) return res.status(401).send("proyecto_id is required.")

        const {
            dominio,
            configuraciones,
            proyecto_id
        } = req.body;

        const searchProyecto = await clientPS.query(`SELECT * FROM proyectos WHERE id = $1`, [proyecto_id])
        if(searchProyecto.rowCount == 0) return res.status(404).send()

        const proyect_id = searchProyecto.rows[0].id;

        await clientPS.query(`INSERT INTO dominios (dominio, configuracion, proyecto_id) VALUES ($1, $2, $3)`, [dominio, configuraciones, proyect_id])

        const envFilePath = path.join(`/etc/nginx/sites-available/`, dominio);
        try {
            fs.writeFileSync(envFilePath, configuraciones, 'utf8');
        }
        catch(err) {
            console.log("ERRROR AA")
            console.log(err)
        }


        res.send()
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = createDominio;