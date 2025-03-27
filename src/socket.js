const { Server } = require('socket.io');
const { updateStreamDate, createStream } = require('./utils/streamController');
const clientPS = require('./db');

let io = null;


const connectSocket = app => {
    io = new Server(app, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log("CONECTO USER")
        socket.on('log-project-join', async (project_id) => {

            const proyecto = await clientPS.query(`SELECT proyect_directory FROM proyectos WHERE id = $1`, [project_id])
            if(proyecto.rowCount != 0) {
                createStream(project_id, proyecto.rows[0].proyect_directory.toLowerCase(), socket)
            }    
        })
        socket.on('log-senal', (stream_id) => {
            updateStreamDate(stream_id)
        })
    })
}

const getIO = () => {
    if(!io) throw new Error('Socket.io no está inicializado');
    return io
}


module.exports = {
    connectSocket,
    getIO
}