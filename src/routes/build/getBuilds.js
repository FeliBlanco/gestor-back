const clientPS = require("../../db");

const getBuilds = async (req, res) => {
    try {
        const project = req.params.project;
        const result = await clientPS.query(`SELECT * FROM builds WHERE proyecto = $1 ORDER BY id DESC`, [project])
        res.send(result.rows)
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }

}

module.exports = getBuilds