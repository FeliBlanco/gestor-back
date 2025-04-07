const clientPS = require("../../db");
const actualizarDNS = require("../../utils/actualizarDNS");

const updateDominio = async (req, res) => {
    try {
        const id = req.params.id;
        if(!"configuracion" in req.body) return res.status(401).send("configuracion is required")
        const {
            configuracion
        } = req.body;

        await clientPS.query(`UPDATE dominios SET configuracion = $1 WHERE id = $2`, [configuracion, id])
        actualizarDNS(id)
        res.send()
    }
    catch(err) {
        res.status(503).send()
    }
}

module.exports = updateDominio;