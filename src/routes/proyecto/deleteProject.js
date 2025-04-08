const clientPS = require("../../db");
const execAsync = require("../../utils/execAsync");
const axios = require("axios");

const deleteProject = async (req, res) => {
    try {
        const id = req.params.id;

        const proyect = await clientPS.query(`
            SELECT 
                P.*,
                G.usuario AS grupo_usuario,
                FW.tipo AS framework_tipo
            FROM 
                proyectos P 
                INNER JOIN grupos G ON G.id = P.grupo
                INNER JOIN frameworks FW ON FW.id = P.framework
            WHERE P.id = $1
            `, [id]);
        if(proyect.rowCount == 0) return res.status(404).send("project not found")
        const data = proyect.rows[0];

        if(data.framework_tipo == "back") {
            await execAsync(`docker rm -f ${data.docker_name} || true`)
        }

        await execAsync(`rm -rf ${global.URL_PROYECTOS}${data.grupo_usuario}/${data.proyect_directory}`)

        await clientPS.query(`DELETE FROM env_vars WHERE proyecto = $1`, [id])


        const dominios = await clientPS.query(`SELECT * FROM dominios WHERE proyecto_id = $1`, [id])

        await Promise.all(dominios.rows.map(async dominio => {
            await execAsync(`rm /etc/nginx/sites-available/${dominio.dominio.toLowerCase()} && rm /etc/nginx/sites-enabled/${dominio.dominio.toLowerCase()}`)
            const response = await axios.get(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records?name=${dominio.dominio.toLowerCase()}`, {
                headers: {
                  "Authorization": `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
                  "Content-Type": "application/json"
                }
            });

            const dnsRecord = response.data.result[0];

            if(dnsRecord) {
                const recordId = dnsRecord.id;
              
                const deleteResponse = await axios.delete(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`, {
                    headers: {
                        "Authorization": `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
                        "Content-Type": "application/json"
                    }
                });
                console.log("SE ELIMINO DNS ", deleteResponse.data)
            } else {
                console.log("NO SE ENCONTRO DNS")
            }

        }))

        await clientPS.query(`DELETE FROM dominios WHERE proyecto_id = $1`, [id])

        await clientPS.query(`DELETE FROM proyectos WHERE id = $1`, [id])

        res.send()
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = deleteProject;