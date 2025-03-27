
const { spawn } = require("child_process");
let streams = []

const createStream = (project_id, docker_name, socket) => {

    const stream_id = `${Date.now()}${Math.random() * 10}`

    const el_stream = spawn("docker", ["logs", "-f", docker_name]);
    streams.push({
        stream_id,
        project_id,
        stream: el_stream,
        date: Date.now()
    })

    el_stream.stdout.on("data", (data) => {
        socket.emit("log-project",data.toString());
    });

    el_stream.stderr.on("data", (data) => {
        socket.emit("log-project", data.toString());
    });

    socket.emit('log-senal', stream_id)

    return stream_id;
}

const updateStreamDate = stream_id => {
    const stream = streams.findIndex(j => j.stream_id == stream_id)
    if(stream != -1) {
        streams[stream].date = Date.now()
    }
}

setInterval(() => {
    let nuevo_streams = []
    streams.forEach((stream, index) => {
        if(!(stream.date + 10000 < Date.now())) {
            nuevo_streams.push(stream)
        } else {
            stream.stream.kill()
        }
    })
    streams = nuevo_streams;
}, 5000)

module.exports = {
    createStream,
    updateStreamDate
};