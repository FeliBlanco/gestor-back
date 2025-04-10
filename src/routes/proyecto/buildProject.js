const moment = require('moment')
const { exec } = require('child_process');
const clientPS = require('../../db');
const { getIO } = require('../../socket');
const fs = require('fs')
const path = require('path')


const buildProject = async (req, res) => {
    const sistema = req.params.id;

    const io = getIO();

    console.log("ACTUALIZAR ENDPOINT")

    if(!sistema) return res.status(400).json({ error: 'Ingresa el ID del sistema' });

    const proyecto = await clientPS.query(`SELECT * FROM proyectos WHERE id = $1`, [sistema])
    if(proyecto.rowCount == 0) return res.status(503).send("No se encontró ningun proyecto")

    const data = proyecto.rows[0];

    const { repositorio, rama, ruta_final, directorio_copiar } = data;

    if(data.actualizando == 1) return res.status(401).send("Ya se está actualizando ese sistema")

    
    const search_ac = await clientPS.query(`SELECT * FROM proyectos WHERE actualizando != 0`, [])
    if(search_ac.rowCount != 0) return res.status(503).send("Ya hay un sistema actualizandose")

    const framework = await clientPS.query(`SELECT * FROM frameworks WHERE id = $1`, [data.framework])
    if(framework.rowCount == 0) return res.status(503).send("No se encontró el framework")

    const grupo = await clientPS.query(`SELECT * FROM grupos WHERE id = $1`, [data.grupo])
    if(grupo.rowCount == 0) return res.status(503).send("No se encontró el grupo")

    const tipo_sistema = framework.rows[0].tipo;
    const tipo_sistema_docker  = data.sistema_docker;

    const fecha = moment().format('D/MM/YYYY HH:mm:ss')
            
    let tiempo_comienzo = Date.now()

    exec('docker image prune' ,() => {})


    const env_vars = await clientPS.query(`SELECT * FROM env_vars WHERE proyecto = $1`, [data.id]);

    let envContent = '';
    if(env_vars.rowCount > 0) {
        env_vars.rows.forEach(row => {
            if (row.key && row.value) {
                envContent += `${row.key}=${row.value}\n`;
            }
        }); 
    }

    const build_log = await clientPS.query(`INSERT INTO builds (proyecto, fecha, commit, rama, status) VALUES ($1, $2, '', $3, 'running') RETURNING id`, [data.id, fecha, data.rama]);
    if(tipo_sistema == "front")  {

        await clientPS.query(`UPDATE proyectos SET actualizando = 1 WHERE id = $1`, [data.id]);
        io.emit('actualizando-state', {state: true})



        
        /*const child = exec(`rm -rf /tmp/build_project2 && git clone ${repositorio} /tmp/build_project2 \
        && cd /tmp/build_project2 \
        && git checkout ${data.build_commit.length > 0 ? data.build_commit : rama} \
        ${envContent.length > 0 ? `&& echo '${envContent}' > /tmp/build_project2/.env` : ''} \
        && docker run --rm \
    -v /tmp/build_project2:/app \
    -v ${global.URL_PROYECTOS}${grupo.rows[0].usuario}:/output \
    -w /app \
    ${tipo_sistema_docker} \
    sh -c "${data.install_command} && ${data.build_command} && cp -r ${data.output_directory}/* /output/${data.proyect_directory}"`, async (error, stdout, stderr) => { */
        
    const child = exec(`docker run --rm \
    -v ${global.URL_PROYECTOS}${grupo.rows[0].usuario}:/output \
    -w /app \
    ${tipo_sistema_docker} \
    sh -c "git clone ${repositorio} /app && cd /app && git checkout ${data.build_commit.length > 0 ? data.build_commit : rama} && ${data.install_command} ${envContent.length > 0 ? `&& echo '${envContent}' > .env` : ''} && ${data.build_command} && cp -r ${data.output_directory}/* /output/${data.proyect_directory}"`, async (error, stdout, stderr) => { 
            if(error) {
                //console.error(`Error ejecutando el script: ${error.message}`);
                clientPS.query(`UPDATE proyectos SET actualizando = 0 WHERE id = $1`, [data.id]);
                io.emit('actualizando-state', {state: false})

                return res.status(500).json({ error: `Error: ${error.message}` });
            }
            
            if(stderr) {
                //console.warn(`Advertencias: ${stderr}`);
            }
            exec('cd /tmp/build_project2 && git rev-parse --short HEAD', async (error2, stdout2) => {
                if(!error2) {
                    await clientPS.query(`UPDATE proyectos SET commit_build = $1 WHERE id = $2`, [stdout2, data.id]);
                    if(build_log && build_log.rowCount > 0) {
                        await clientPS.query(`UPDATE builds SET commit = $1 WHERE id = $2`, [stdout2, build_log.rows[0].id]);
                    }
                }
            })
            await clientPS.query(`UPDATE proyectos SET actualizando = 0, fecha_build = $1 WHERE id = $2`, [fecha, data.id]);
            
            io.emit('actualizando-state', {state: false})

            res.json({ output: stdout || stderr });
        })

        /*const child = exec(`bash /home/actualizadores/script.sh ${repositorio} ${rama} ${ruta_final} ${directorio_copiar}`, (error, stdout, stderr) => {
            if(error) {
                console.error(`Error ejecutando el script: ${error.message}`);
                clientPS.query(`UPDATE proyectos SET actualizando = 0 WHERE id = $1`, [data.id]);
                return res.status(500).json({ error: `Error: ${error.message}` });
            }
            
            if(stderr) {
                console.warn(`Advertencias: ${stderr}`);
            }
            clientPS.query(`UPDATE proyectos SET actualizando = 0 WHERE id = $1`, [data.id]);
            res.json({ output: stdout || stderr });
        });*/

        child.stdout.on('data', (data) => {
            const hora = moment().format('HH:mm:ss')
            io.emit('build-log', {text: `[${hora}] ${data}`, type:"ok"})
        });

        child.stderr.on('data', (data) => {
            const hora = moment().format('HH:mm:ss')
            io.emit('build-log', {text: `[${hora}] ${data}`, type:"warning"});
        });

        child.on('close', (code) => {
            const hora = moment().format('HH:mm:ss')

            if(code == 0) {
                io.emit('build-log', {text: `[${hora}] success`, type:"success"});
            } else {
                io.emit('build-log', {text: `[${hora}] error`, type:"error"});
            }

            if(build_log && build_log.rowCount > 0) {
                let status = code == 0 ? 'success' : 'error'
                let tiempo_final = Date.now()

                const tiempo_build = tiempo_final - tiempo_comienzo;

                clientPS.query(`UPDATE builds SET status = $1, time = $2 WHERE id = $3`, [status, tiempo_build, build_log.rows[0].id]);
            }
        });


    } else if(tipo_sistema == "back") {
        try {
            const envFilePath = path.join(global.URL_PROYECTOS, grupo.rows[0].usuario, data.proyect_directory, '.env');
            fs.writeFileSync(envFilePath, envContent, 'utf8');
        }
        catch(err) {
            console.log(err)
            console.log("ERROR AL PEGAR EL .ENV")
        }
        clientPS.query(`UPDATE proyectos SET actualizando = 1 WHERE id = $1`, [data.id]);
        //const child = exec(`cd ${global.URL_PROYECTOS}${grupo.rows[0].usuario}/${data.proyect_directory} && git checkout ${rama} && git pull && docker-compose up --build -d`, (error, stdout, stderr) => {
        
            const comandos = []

            if(data.install_command && data.install_command.length > 1) {
                comandos.push(data.install_command)
            }
            if(data.build_command && data.build_command.length > 1) {
                comandos.push(data.build_command)
            }
            if(data.start_command && data.start_command.length > 1) {
                comandos.push(data.start_command)
            }
        
            console.log(`Deploying in ${global.URL_PROYECTOS}${grupo.rows[0].usuario}/${data.proyect_directory}...`)
            const child = exec(`
            cd ${global.URL_PROYECTOS}${grupo.rows[0].usuario}/${data.proyect_directory} &&
            git checkout ${data.build_commit.length > 0 ? data.build_commit : rama} &&
            ${data.build_commit.length == 0 && `git pull &&`}
            docker rm -f ${data.docker_name} || true &&
            docker run -d --name ${data.docker_name} --restart=unless-stopped -p ${data.puerto}:${data.system_port} -v $(pwd):/app -w /app ${tipo_sistema_docker} sh -c "${comandos.join(' && ')}"`
            , async (error, stdout, stderr) => {
            if(error) {
                console.error(`Error ejecutando el script: ${error.message}`);
                clientPS.query(`UPDATE proyectos SET actualizando = 0 WHERE id = $1`, [data.id]);
                return res.status(500).json({ error: `Error: ${error.message}` });
            }
            if(stderr) {
                console.warn(`Advertencias: ${stderr}`);
            }

            exec('git rev-parse --short HEAD', async (error2, stdout2) => {
                if(!error2) {
                    await clientPS.query(`UPDATE proyectos SET commit_build = $1 WHERE id = $2`, [stdout2, data.id]);
                    if(build_log && build_log.rowCount > 0) {
                        await clientPS.query(`UPDATE builds SET commit = $1 WHERE id = $2`, [stdout2, build_log.rows[0].id]);
                    }
                }
            })
            await clientPS.query(`UPDATE proyectos SET actualizando = 0, fecha_build = $1 WHERE id = $2`, [fecha, data.id]);

            res.json({ output: stdout || stderr });
        });

        child.stdout.on('data', (data) => {
            const hora = moment().format('HH:mm:ss')
            io.emit('build-log', {text: `[${hora}] ${data}`, type:"ok"})
        });

        child.stderr.on('data', (data) => {
            const hora = moment().format('HH:mm:ss')
            io.emit('build-log', {text: `[${hora}] ${data}`, type:"warning"});
        });

        child.on('close', (code) => {
            const hora = moment().format('HH:mm:ss')

            if(code == 0) {
                io.emit('build-log', {text: `[${hora}] success`, type:"success"});
            } else {
                io.emit('build-log', {text: `[${hora}] error`, type:"error"});
            }

            if(build_log && build_log.rowCount > 0) {
                let status = code == 0 ? 'success' : 'error'
                let tiempo_final = Date.now()

                const tiempo_build = tiempo_final - tiempo_comienzo;

                clientPS.query(`UPDATE builds SET status = $1, time = $2 WHERE id = $3`, [status, tiempo_build, build_log.rows[0].id]);
            }

        });
    }
}

module.exports = buildProject;