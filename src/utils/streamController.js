
const { spawn } = require("child_process");
let streams = []

const createStream = (project_id, docker_name, socket) => {

    const stream_id = `${Date.now()}${Math.random() * 10}`

    const el_stream = spawn("docker", ["logs", "-f", docker_name]);
    streams.push({
        stream_id,
        project_id,
        stream: el_stream
    })

    el_stream.stdout.on("data", (data) => {
        socket.emit("log-project",data.toString());
    });

    el_stream.stderr.on("data", (data) => {
        socket.emit("log-project", data.toString());
    });
    return stream_id;
}

const updateStreamDate = stream_id => {

}

module.exports = {
    createStream,
    updateStreamDate
};