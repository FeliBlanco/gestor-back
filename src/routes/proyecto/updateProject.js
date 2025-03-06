const clientPS = require("../../db");


const updateProject = (req, res) => {
    const id = req.params.id;
    const {
        nombre,
        repositorio,
        rama,
        ruta_final,
        directorio_copiar,
        type
    } = req.body;


    let data = {};

    if(nombre) data.nombre = nombre;
    if(repositorio) data.repositorio = repositorio;
    if(rama) data.rama = rama;
    if(ruta_final) data.ruta_final = ruta_final;
    if(directorio_copiar) data.directorio_copiar = directorio_copiar;
    if(type) data.type = type;

    let query = []
    let values = []
    Object.keys(data).forEach((value, index) => {
        query.push(`${value} = $${index + 1}`)
        values.push(data[value])
    })

    clientPS
    .query(`UPDATE proyectos SET ${query.join(',')} WHERE id = ${id}`, values).then(res => {
        res.send()
    })
    .catch(err => {
        res.status(503).send()
    })
}

module.exports = updateProject;