const fs = require('fs/promises');

const updateConfig = async(req, res) => {
    try {
        try {
            await fs.writeFile(global.dirname+'/webhook.json', JSON.stringify(req.body, null, 2));
            console.log('JSON escrito con éxito');
            res.send()
        } catch (err) {
            console.error('Error al escribir el JSON:', err);
            res.status(503).send()
        }

    }
    catch(err) {
        res.status(503).send()
    }
}

module.exports = updateConfig;