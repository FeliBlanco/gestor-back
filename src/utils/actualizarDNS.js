const clientPS = require("../db");
const path = require('path')
const fs = require('fs')

const actualizarDNS = async (dominio_id) => {
    try {
        const response = await clientPS.query(`SELECT * FROM dominios WHERE id = $1`, [dominio_id])
        if(response.rowCount > 0) {
            const data = response.rows[0]
            const envFilePath = path.join(`/etc/nginx/sites-available/`, data.dominio);

            console.log("ACTUALIAR DNS")
            console.log(envFilePath)

            const conf = data.configuracion.replace('[dominio]', data.dominio)

            await fs.writeFileSync(envFilePath, conf, 'utf8');
            exec(`sudo ln -i /etc/nginx/sites-avaiable/${dominio} /etc/nginx/sites-enabled/`, async(error, stdout, stderr) => {

            })
        }
    }
    catch(err) {
        console.log(err)
    }
}

module.exports = actualizarDNS;