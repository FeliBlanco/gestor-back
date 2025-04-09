const clientPS = require("../../db");

const updatePassword = async (req, res) => {
    try {
        const {
            password
        } = req.body;

        await clientPS.query(`UPDATE usuarios SET password = $1, cambio_contra = 1 WHERE id = $2`, [password, req.user.id])
        res.send()
    }
    catch(err) {
        res.status(503).send()
    }
}

module.exports = updatePassword;