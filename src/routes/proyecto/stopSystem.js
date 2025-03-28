const clientPS = require("../../db");

const { exec } = require('child_process');
const { getIO } = require("../../socket");

const stopSystem = async (req, res) => {
    try {

        const io = getIO()

        const proyecto = req.params.proyecto;
        const projectData = await clientPS.query(`SELECT * FROM proyectos WHERE id = $1`, [proyecto]);
        if(projectData.rowCount == 0) return res.status(404).send("no project found");

        const data = projectData.rows[0];

        if(data.status == "stopped") return res.status(404).send("project is already stopped")

        await clientPS.query(`UPDATE proyectos SET status = 'stopped' WHERE id = $1`, [data.id])
        
        exec(`docker rm -f ${data.proyect_directory.toLowerCase()} || true`, (err, stdout, stderr) => {
            io.to(`project-${data.id}`).emit('change_status', 'stopped')
            res.send()
        })

    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = stopSystem;