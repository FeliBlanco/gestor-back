const clientPS = require("../../db");

const getFramworks = async (req, res) => {
    try {
        const result = await clientPS.query(`SELECT * FROM frameworks`, []);
        res.send(result.rows)
    }
    catch(err) {
        res.status(503).send()
    }
}

module.exports = getFramworks