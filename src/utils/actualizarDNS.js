const clientPS = require("../db");
const path = require('path')

const actualizarDNS = async (dominio_id) => {
    try {
        const response = await clientPS.query(`SELECT * FROM dominios WHERE id = $1`, [dominio_id])
        if(response.rowCount > 0) {
            const data = response.rows[0]
            const envFilePath = path.join(`/etc/nginx/sites-available/`, data.dominio);

            console.log("ACTUALIAR DNS")
            console.log(envFilePath)

            await fs.writeFileSync(envFilePath, data.configuracion, 'utf8');
            exec(`sudo ln -i /etc/nginx/sites-avaiable/${dominio} /etc/nginx/sites-enabled/`, async(error, stdout, stderr) => {

            })
        }
    }
    catch(err) {
        console.log(err)
    }
}

module.exports = actualizarDNS;