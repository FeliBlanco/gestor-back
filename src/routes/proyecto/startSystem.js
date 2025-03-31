const clientPS = require("../../db");

const { exec } = require('child_process');
const { getIO } = require("../../socket");

const startSystem = async (req, res) => {
    try {

        const io = getIO()

        const proyecto = req.params.proyecto;
        const projectData = await clientPS.query(`SELECT P.*, FW.tipo_sistema_docker FROM proyectos P INNER JOIN frameworks FW ON FW.id = P.framework WHERE P.id = $1`, [proyecto]);
        if(projectData.rowCount == 0) return res.status(404).send("no project found");

        const data = projectData.rows[0];

        if(data.status == "running") return res.status(404).send("project is already running")

        const grupo = await clientPS.query(`SELECT * FROM grupos WHERE id = $1`, [data.grupo])
        if(grupo.rowCount == 0) return res.status(503).send("No se encontró el grupo")

        await clientPS.query(`UPDATE proyectos SET status = 'running' WHERE id = $1`, [data.id])

        exec(`
            cd ${global.URL_PROYECTOS}${grupo.rows[0].usuario}/${data.proyect_directory} &&
            docker start ${data.docker_name}`
            , async (error, stdout, stderr) => {
                io.to(`project-${data.id}`).emit('change_status', 'running')
                if(error) console.log(error)
                if(stdout) console.log(stdout)
                if(stderr) console.log(stderr)                
                res.send()
        })

    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = startSystem