const clientPS = require("../../db");


const updateProject = async (req, res) => {
    try {

        const id = req.params.id;
        const {
            build_command,
            install_command,
            output_directory,
            rama,
            start_command,
            env_vars,
            system_port,
            sistema_docker,
            build_commit
        } = req.body;
    
    
        let data = {};
    
        if(build_command) data.build_command = build_command;
        if(install_command) data.install_command = install_command;
        if(output_directory) data.output_directory = output_directory;
        if(rama) data.rama = rama;
        if(start_command) data.start_command = start_command;
        if(system_port) data.system_port = system_port;
        if(sistema_docker) data.sistema_docker = sistema_docker;
        if("build_commit" in req.body) data.build_commit = build_commit;
        
        if(env_vars) {
            await clientPS.query(`DELETE FROM env_vars WHERE proyecto = $1`, [id])
            try {
                env_vars.forEach(async env => {

                    await clientPS.query(`INSERT INTO env_vars (key, value, proyecto) VALUES ($1, $2, $3)`, [env.key, env.value, id])
                })
            }
            catch(err) {
                console.log(err)
            }
        }
    
        let query = []
        let values = []
        Object.keys(data).forEach((value, index) => {
            query.push(`${value} = $${index + 1}`)
            values.push(data[value])
        })
    
        await clientPS.query(`UPDATE proyectos SET ${query.join(',')} WHERE id = ${id}`, values)
        res.send()
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = updateProject;