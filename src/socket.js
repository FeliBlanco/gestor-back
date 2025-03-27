const { Server } = require('socket.io');

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
        socket.on('log-project-interval', () => {
            console.log("STRAM KILL")
            //logStream.kill();
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