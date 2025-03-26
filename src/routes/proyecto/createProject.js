const moment = require('moment')
const { exec } = require('child_process');
const clientPS = require('../../db');
const actualizarDNS = require('../../utils/actualizarDNS');
const axios = require('axios')


const createProject = async (req, res) => {
    const {
        nombre,
        git_repo,
        framework,
        rama,
        build_settings,
        enviroment_variables,
        grupo
    } = req.body;

    if(!nombre || !git_repo || !rama || !build_settings) return res.status(503).send();

    const { default: getPort, portNumbers } = await import('get-port');


    const {
        build_command,
        install_command,
        output_directory
    } = build_settings

    const fecha = moment().format('D/MM/YYYY')

    const usuario = nombre.replaceAll(' ', '-')


    let proyect_directory = usuario;

    const search_di = await clientPS.query(`SELECT id FROM proyectos WHERE proyect_directory = $1`, [usuario])
    if(search_di.rowCount > 0) {
        proyect_directory = `${usuario}-${search_di.rowCount + 1}`
    }

    const grupoData = await clientPS.query(`SELECT id, usuario FROM grupos WHERE id = $1`, [grupo])
    if(grupoData.rowCount == 0) return res.status(404).send("no se encontro grupo")
        
    const frameworkData = await clientPS.query(`SELECT * FROM frameworks WHERE id = $1`, [framework])
    if(frameworkData.rowCount == 0) return res.status(404).send("no se encontro framework")

    clientPS
    .query(`
        INSERT INTO proyectos 
        (
        nombre,
        repositorio,
        rama,
        framework,
        fecha_creacion,
        usuario,
        build_command,
        install_command,
        output_directory,
        proyect_directory,
        grupo
        ) VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10,
         $11
         ) RETURNING id`, [
            nombre,
            git_repo,
            rama,
            framework,
            fecha,
            usuario,
            build_command,
            install_command,
            output_directory,
            proyect_directory,
            grupo
        ])
    .then(async response => {
        for(const env_var of enviroment_variables) {
            if(env_var.key.length > 0) {
                await clientPS.query(`INSERT INTO env_vars (proyecto, key, value) VALUES ($1, $2, $3)`, [response.rows[0].id, env_var.key, env_var.value])
            }
        }
        if(frameworkData.rows[0].tipo == "back") {
            let puerto_usar = 0;
            let intentos = 0;
            while(puerto_usar == 0) {
                const port = await getPort({
                    port: portNumbers(3000, 6000),
                  });
                const search_port = await clientPS.query(`SELECT id FROM proyectos WHERE puerto = $1`, [port]);
                if(search_port.rowCount == 0) {
                    puerto_usar = port;
                    await clientPS.query(`UPDATE proyectos SET puerto = $1 WHERE id = $2`, [port, response.rows[0].id]);
                } else {
                    intentos ++;
                }
                if(intentos >= 5) {
                    console.log("No se encontró un puerto disponible!")
                    break;
                }
            }
        }
        const directorio = `${global.URL_PROYECTOS}${grupoData.rows[0].usuario}/${proyect_directory}`
        await exec(`mkdir -p ${directorio}`, async (error, stdout, stderr) => {
            if(error) {
                console.log("ERROR AL CREAR DIRECTORIO CREAR PROYECTO")
                console.log(error)
            } else {

                const dominio = `${proyect_directory}-${nombre}.${process.env.DOMINIO}`
                await axios.post(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, {
                    type: "A", // Tipo de registro (A para IPv4, CNAME para redireccionar)
                    name: dominio, // Nombre del subdominio (ej: api.tudominio.com)
                    content: process.env.IP_SERVER, // IP a la que apunta el subdominio
                    ttl: 1, // TTL (1 = automático)
                    proxied: false // false si no quieres que pase por Cloudflare 
                })

                const configuraciones = `server {\n\tlisten 80;\n\tserver_name ${dominio}.${process.env.DOMINIO};\n\tlocation / {\n\n\t}\n}`
                const responseDNS = await clientPS.query(`INSERT INTO dominios (dominio, configuracion, proyecto_id) VALUES ($1, $2, $3)`, [dominio, configuraciones, response.rows[0].id])
                actualizarDNS(responseDNS.rows[0].id)

                if(frameworkData.rows[0].tipo == "back") {
                    exec(`cd ${directorio} && git clone ${git_repo} .`, (errorC, stdoutC, stderrC) => {

                    })
                }
            }

        })
        res.send({usuario: usuario})
    })
    .catch(err => {
        console.log(err)
        res.status(503).send()
    })
}

module.exports = createProject;