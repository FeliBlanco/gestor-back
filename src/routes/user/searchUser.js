const clientPS = require("../../db");

const searchUser = async (req, res) => {
    try {
        const query = req.query.query;
        const response = await clientPS.query(`SELECT id, username FROM usuarios WHERE username LIKE $1 LIMIT 5`, [`%${query}%`])
        res.send(response.rows)
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = searchUser;