const clientPS = require("../../db");

const jwt = require('jsonwebtoken')

const login = async (req, res) => {
    try {
        if(!"username" in req.body) return res.status(401).send("username is required.")
        if(!"password" in req.body) return res.status(401).send("password is required.")

        const {
            username,
            password
        } = req.body;

        const response = await clientPS.query(`SELECT * FROM usuarios WHERE username = $1`, [username]);
        if(response.rowCount == 0) return res.status(403).send("user not found");

        const user = response.rows[0]
        if(user.password == password) {

            const token = jwt.sign({
                userid: user.id
            }, process.env.JWT_SECRET)

            res.send(token)
        } else {
            res.status(403).send("incorrect password")
        }
    }
    catch(err) {
        res.status(503).send()
    }
}

module.exports = login;