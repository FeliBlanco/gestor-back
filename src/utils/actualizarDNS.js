const clientPS = require("../db");
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process');

const actualizarDNS = async (dominio_id) => {
    try {
        const response = await clientPS.query(`
            SELECT 
                D.*,
                G.usuario AS grupo_usuario,
                P.proyect_directory
            FROM 
                dominios D
            INNER JOIN proyectos P ON P.id = D.proyecto_id 
            INNER JOIN grupos G ON G.id = P.grupo 
            WHERE D.id = $1`, [dominio_id])
        console.log(response.rows)
        if(response.rowCount > 0) {

            const data = response.rows[0]
            const envFilePath = path.join(`/etc/nginx/sites-available/`, data.dominio.toLowerCase());

            console.log("ACTUALIAR DNS")
            console.log(envFilePath)

            let conf = data.configuracion.replaceAll('[dominio]', data.dominio.toLowerCase())

            const directorio = `${global.URL_PROYECTOS}${data.grupo_usuario}/${data.proyect_directory}`

            conf = data.configuracion.replaceAll('[directory]', directorio)


            await fs.writeFileSync(envFilePath, conf, 'utf8');
            exec(`sudo ln -i /etc/nginx/sites-available/${data.dominio.toLowerCase()} /etc/nginx/sites-enabled/ && sudo systemctl restart nginx`, async(error, stdout, stderr) => {

            })
        }
    }
    catch(err) {
        console.log(err)
    }
}

module.exports = actualizarDNS;