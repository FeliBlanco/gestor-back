const clientPS = require("../../db");

const getGroup = (req, res) => {
    const grupo = req.params.grupo;

    clientPS.query(`SELECT * FROM grupos WHERE usuario = $1`, [grupo])
    .then(response => {
        if(response.rowCount == 1) {
            res.send(response.rows[0])
        } else {
            res.status(404).send("no encontrado")
        }
    })
    .catch(err => {
        console.log(err)
        res.status(503).send()
    })
}

module.exports = getGroup;