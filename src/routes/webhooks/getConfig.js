const fs = require('fs/promises');

const getConfig = async (req, res) => {
    try {
        const contenido = await fs.readFile(global.dirname+'/webhook.json', 'utf-8');
        const json = JSON.parse(contenido);

        res.send(json)
    }
    catch(err) {
        console.log(err)
        res.status(503).send();
    }
}

module.exports = getConfig;