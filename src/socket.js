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
                const stream_id = createStream(project, proyecto.rows[0].proyect_directory.toLowerCase(), io)
    
                console.log("JOIN PROJECT")
                socket.join(`stream-${stream_id}`)
            }
    
        
        })
        socket.on('log-project-interval', () => {
            console.log("STRAM KILL")
            //logStream.kill();
            updateStreamDate()
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