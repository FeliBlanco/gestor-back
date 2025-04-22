const { default: axios } = require("axios")

const webhookMeta = async (req, res) => {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    //console.log(req)

    console.log("JOLAA")

    if (mode === 'subscribe' && token === "twillo") {

        try {
            const contenido = await fs.readFile(global.dirname+'/webhook.json', 'utf-8');
            const json = JSON.parse(contenido);

            const urls = json.urls;

            for(const url of urls) {
                try {
                    await axios.get(url, {
                        params: req.query
                    })
                    console.log(`Enviado a ${url}`)
                }
                catch(err) {
                    console.log(`Error ${err.status} al enviar a ${url}`)
                }
            }
        }
        catch(err) {
            console.log(err)
        }


        console.log('Webhook verificado')
        res.status(200).send(challenge)
    } else {
        res.sendStatus(403)
    }
}

module.exports = webhookMeta;