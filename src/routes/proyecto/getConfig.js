const clientPS = require("../../db");

const getConfig = async (req, res) => {
    try {
        const project_id = req.params.proyecto;
        const result = await clientPS.query(`SELECT P.nombre, P.build_commit, P.sistema_docker, P.system_port, P.start_command, P.build_command, P.install_command, P.output_directory, P.repositorio, P.rama, P.framework, F.nombre AS framework, F.id AS framework_id FROM proyectos P LEFT JOIN frameworks F ON F.id = P.framework WHERE P.id = $1`, [project_id])
        if(result.rowCount == 0) return res.status(404).send()

        let env_vars = []
        const result_envs = await clientPS.query(`SELECT * FROM env_vars WHERE proyecto = $1`, [project_id])
        if(result_envs.rowCount > 0) {
            env_vars = result_envs.rows.map((env) => ({...env, value: env.oculto == true ? new Array(env.value.length).fill('*').join('') : env.value }))
        }

        res.send({
            ...result.rows[0],
            env_vars
        })
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = getConfig;