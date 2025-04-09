const clientPS = require("../db");
const jwt = require('jsonwebtoken')

const isLogged = async (req, res, next) => {
    try {
        const auth = req.headers['authorization']
        if(!auth) return res.status(403).send("token no provider")
        const token = auth.split('Bearer ')[1]
        if(!token) return res.status(403).send("token no provider")
        var decoded = jwt.verify(token, process.env.JWT_SECRET);

        const response = await clientPS.query(`SELECT * FROM usuarios WHERE id = $1`, [decoded.userid])
        if(response.rowCount == 0) return res.status(404).send("user not found");
        let user_data = {
            ...response.rows[0],
            password: undefined
        }
        req.user = user_data
        next()
    } catch(err) {
        console.log(err)
        res.status(404).send()
    }
}

module.exports = isLogged;