const clientPS = require("../../db");

const deleteGroup = async (req, res) => {
    try {
        const id = req.params.id;

        await clientPS.query(`DELETE FROM grupos WHERE usuario = $1`, [id])
        
        res.send()
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}
module.exports = deleteGroup;