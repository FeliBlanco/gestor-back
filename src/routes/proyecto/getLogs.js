const { spawn } = require("child_process");
const clientPS = require("../../db");
const { getIO } = require("../../socket");


const getLogs = async (req, res) => {
    const project = req.params.proyecto;

    const io = getIO()

    const proyecto = await clientPS.query(`SELECT proyect_directory FROM proyectos WHERE id = $1`, [project])
    if(proyecto.rowCount == 0) return res.status(404).send()

    const logStream = spawn("docker", ["logs", "-f", proyecto.rows[0].proyect_directory.toLowerCase()]);

    io.on("connection", (socket) => {
        logStream.stdout.on("data", (data) => {
            socket.emit("log-project", {
                project,
                data: data.toString()
            });
        });
        
        logStream.stderr.on("data", (data) => {
            socket.emit("log-project", {
                project,
                data: data.toString()
            });
        });
        socket.on('disconnect', () => {
            console.log("STRAM KILL")
            logStream.kill();
        })
    })

    res.send()
}

module.exports = getLogs;