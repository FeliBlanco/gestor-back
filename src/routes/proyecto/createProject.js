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
        start_command,
        output_directory
    } = build_settings

    const fecha = moment().format('D/MM/YYYY')

    const usuario = nombre.replaceAll(' ', '-')


    let proyect_directory = usuario;

    const search_di = await clientPS.query(`SELECT id FROM proyectos WHERE proyect_directory = $1`, [usuario])
    if(search_di.rowCount > 0) {
        proyect_directory = `${usuario}-${search_di.rowCount + 1}`
    }

    proyect_directory = proyect_directory.toLowerCase()

    
    const grupoData = await clientPS.query(`SELECT id, usuario FROM grupos WHERE id = $1`, [grupo])
    if(grupoData.rowCount == 0) return res.status(404).send("no se encontro grupo")
        
    const frameworkData = await clientPS.query(`SELECT * FROM frameworks WHERE id = $1`, [framework])
    if(frameworkData.rowCount == 0) return res.status(404).send("no se encontro framework")

    const sistema_docker = frameworkData.rows[0].tipo_sistema_docker;
    const docker_name = `${grupoData.rows[0].usuario.toLowerCase()}${proyect_directory}`;

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
        start_command,
        grupo,
        docker_name,
        sistema_docker,
        creador
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
         $11,
         $12,
         $13,
         $14,
         $15
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
            start_command,
            grupo,
            docker_name,
            sistema_docker,
            req.user.id
        ])
    .then(async response => {
        for(const env_var of enviroment_variables) {
            if(env_var.key.length > 0) {
                await clientPS.query(`INSERT INTO env_vars (proyecto, key, value) VALUES ($1, $2, $3)`, [response.rows[0].id, env_var.key, env_var.value])
            }
        }
        let puerto_usar = 0;
        if(frameworkData.rows[0].tipo == "back") {
            let intentos = 0;
            while(puerto_usar == 0) {
                const port = await getPort({
                    port: portNumbers(3050, 6000),
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

                const dominio = `${grupoData.rows[0].usuario.toLowerCase()}-${proyect_directory}.${process.env.DOMINIO}`
                try {

                    await axios.post(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, {
                        type: "A", // Tipo de registro (A para IPv4, CNAME para redireccionar)
                        name: dominio, // Nombre del subdominio (ej: api.tudominio.com)
                        content: `${process.env.IP_SERVER}`, // IP a la que apunta el subdominio
                        ttl: 1, // TTL (1 = automático)
                        proxied: true, // false si no quieres que pase por Cloudflare 
                    },
                    {
                        headers: {
                            "Authorization": `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
                            "Content-Type": "application/json"
                        }
                    })
                }
                catch(err_dns) {
                    console.log("EL ERROR")
                    console.log(err_dns.response.data.errors)
                }

                let configuraciones = ""
                
                if(frameworkData.rows[0].tipo == "back") {
                    exec(`cd ${directorio} && git clone ${git_repo} .`, (errorC, stdoutC, stderrC) => {

                    })
                    configuraciones = `server {\n\tlisten 80;\n\tserver_name [dominio];\n\tlocation / {\nproxy_pass http://localhost:${puerto_usar};\nproxy_http_version 1.1;\nproxy_set_header Upgrade $http_upgrade;\nproxy_set_header Connection 'upgrade';\n proxy_set_header Host $host;\nproxy_cache_bypass $http_upgrade;\n\t}\n}`
                } else if(frameworkData.rows[0].tipo == "front") {
                    configuraciones = `server {\n\tlisten 80;\n\tserver_name [dominio];\n\tlocation / {\nroot ${directorio};\nindex index.html;\ntry_files $uri $uri/ /index.html;\n\t}\n}`
                }

                const responseDNS = await clientPS.query(`INSERT INTO dominios (dominio, configuracion, proyecto_id) VALUES ($1, $2, $3) RETURNING id`, [dominio, configuraciones, response.rows[0].id])
                actualizarDNS(responseDNS.rows[0].id)
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