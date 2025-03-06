require('dotenv').config()

const http = require('http')
const app = require('./src/app')

const { connectSocket } = require('./src/socket')

global.URL_PROYECTOS = "/home/proyectos/"

const server = http.createServer(app)


connectSocket(server)

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`PORT: ${PORT}`))