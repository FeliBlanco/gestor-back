const moment = require('moment')
const { exec } = require('child_process');
const clientPS = require('../../db');


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
        const directorio = `${global.URL_PROYECTOS}${grupoData.rows[0].usuario}/${proyect_directory}`
        await exec(`mkdir -p ${directorio}`, (error, stdout, stderr) => {
            if(error) {
                console.log("ERROR AL CREAR DIRECTORIO CREAR PROYECTO")
                console.log(error)
            } else {
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