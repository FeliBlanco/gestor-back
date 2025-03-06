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