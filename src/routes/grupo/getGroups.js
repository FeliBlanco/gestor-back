const clientPS = require("../../db");

const getGroups = async (req, res) => {
    try {
        const result = await clientPS.query(`
            WITH grupos_con_proyectos AS (
  SELECT 
    g.*, 
    COUNT(DISTINCT p.id) AS cantidad_proyectos,
    BOOL_OR(p.creador = $1) OR BOOL_OR(mp.user_id IS NOT NULL) AS tiene_acceso
  FROM grupos g
  JOIN proyectos p ON p.grupo = g.id
  LEFT JOIN miembros_proyectos mp ON mp.project_id = p.id AND mp.user_id = $1
  GROUP BY g.id
),
grupos_sin_proyectos AS (
  SELECT 
    g.*, 
    0 AS cantidad_proyectos,
    FALSE AS tiene_acceso
  FROM grupos g
  WHERE NOT EXISTS (
    SELECT 1 FROM proyectos p WHERE p.grupo = g.id
  )
)
SELECT * FROM (
  SELECT * FROM grupos_con_proyectos
  UNION ALL
  SELECT * FROM grupos_sin_proyectos
) AS todos_los_grupos
JOIN usuarios u ON u.id = $1
WHERE 
  (todos_los_grupos.cantidad_proyectos = 0 AND u.admin = 1)
  OR (todos_los_grupos.cantidad_proyectos > 0 AND (u.admin = 1 OR todos_los_grupos.tiene_acceso = TRUE))`, [req.user.id]);
        console.log(result.rows)
        res.send(result.rows)
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = getGroups;