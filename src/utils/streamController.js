
const { spawn } = require("child_process");
let streams = []

const createStream = (project_id, docker_name, io) => {

    const stream = streams.find(j => j.project_id == project_id);

    let el_stream = null;

    if(stream) {
        el_stream = stream.stream;
        console.log("SE USA EL STREAM EXISTENTE")
    } else {
        console.log("SE CREA UN STREAM NUEVO")
        el_stream = spawn("docker", ["logs", "-f", docker_name]);
        streams.push({
            project_id,
            stream: el_stream
        })
    }

    el_stream.stdout.on("data", (data) => {
        io.to(`project-${project_id}`).emit("log-project",data.toString());
    });

    el_stream.stderr.on("data", (data) => {
        io.to(`project-${project_id}`).emit("log-project", data.toString());
    });
}

const updateStreamDate = stream_id => {

}

module.exports = {
    createStream,
    updateStreamDate
};