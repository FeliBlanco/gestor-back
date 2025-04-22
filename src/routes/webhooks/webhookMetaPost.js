const { default: axios } = require("axios");

const webhookMetaPost = async(req, res) => {
    console.log("POST")
    console.log(req.body)
    res.status(200).send()
    try {
        const contenido = await fs.readFile(global.dirname+'/webhook.json', 'utf-8');
        const json = JSON.parse(contenido);
        
        const urls = json.urls;
        
        for(const url of urls) {
            try {
                await axios.post(url, req.body)
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
}

module.exports = webhookMetaPost;