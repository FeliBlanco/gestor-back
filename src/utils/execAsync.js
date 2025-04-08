const { exec } = require('child_process')

function execAsync(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            resolve([err, stdout, stderr]);
        });
    });
}

module.exports = execAsync;