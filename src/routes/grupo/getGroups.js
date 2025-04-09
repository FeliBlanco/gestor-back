const clientPS = require("../../db");

const getGroups = async (req, res) => {
    try {
        const result = await clientPS.query(`
            SELECT 
                g.*, 
                COUNT(p.id) AS cantidadProyectos
            FROM grupos g
                JOIN proyectos p ON p.grupo = g.id
                LEFT JOIN miembros_proyectos mp ON mp.project_id = p.id AND mp.user_id = $1
            WHERE p.creador = $1 OR mp.user_id IS NOT NULL
            GROUP BY g.id
            HAVING COUNT(p.id) > 0;`, [req.user.id]);
        console.log(result.rows)
        res.send(result.rows)
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = getGroups;