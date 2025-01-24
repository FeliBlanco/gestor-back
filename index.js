const express = require('express');
require('dotenv').config()
const { exec } = require('child_process');
const { Client } = require('pg');
const cors = require('cors');



const app = express();
app.use(express.json());
app.use(cors());


const clientPS = new Client({
    user: 'postgres',
    host: '149.50.144.176',
    database: 'gestor',
    password: 'sULaSplavaSTouSCAuDirESat',
    port: 5432,
});

clientPS.connect().then(() => console.log('Conexión exitosa a PostgreSQL')).catch(err => console.error('Error de conexión', err.stack));

const PORT = process.env.PORT || 3000;


app.get('/actualizar', (req, res) => {
    const { sistema } = req.query;

    if(!sistema) return res.status(400).json({ error: 'Ingresa el ID del sistema' });

    clientPS.query(`SELECT * FROM proyectos WHERE id = $1`, [sistema]).then(response => {
        if(response.rows.length > 0) {
            const data = response.rows[0];
            const { repositorio, rama, ruta_final, directorio_copiar } = data;

            if(data.actualizando == 1) return res.status(401).send("Ya se está actualizando ese sistema")
            if(data.type == "front")  {
                clientPS.query(`UPDATE proyectos SET actualizando = 1 WHERE id = $1`, [data.id]);

                exec(`bash /home/actualizadores/script.sh ${repositorio} ${rama} ${ruta_final} ${directorio_copiar}`, (error, stdout, stderr) => {
                    if(error) {
                        console.error(`Error ejecutando el script: ${error.message}`);
                        clientPS.query(`UPDATE proyectos SET actualizando = 0 WHERE id = $1`, [data.id]);
                        return res.status(500).json({ error: `Error: ${error.message}` });
                    }
            
                    if(stderr) {
                        console.warn(`Advertencias: ${stderr}`);
                    }
                    clientPS.query(`UPDATE proyectos SET actualizando = 0 WHERE id = $1`, [data.id]);
                    res.json({ output: stdout || stderr });
                });
            } else if(data.type == "back") {
                clientPS.query(`UPDATE proyectos SET actualizando = 1 WHERE id = $1`, [data.id]);
                exec(`cd ${ruta_final} && git pull && docker-compose up --build -d`, (error, stdout, stderr) => {
                    if(error) {
                        console.error(`Error ejecutando el script: ${error.message}`);
                        clientPS.query(`UPDATE proyectos SET actualizando = 0 WHERE id = $1`, [data.id]);
                        return res.status(500).json({ error: `Error: ${error.message}` });
                    }
            
                    if(stderr) {
                        console.warn(`Advertencias: ${stderr}`);
                    }
                    clientPS.query(`UPDATE proyectos SET actualizando = 0 WHERE id = $1`, [data.id]);
                    res.json({ output: stdout || stderr });
                });
            }
        }
        else {
            res.status(503).send("No se encontró ningun proyecto")
        }
    })
    .catch(err => {
        res.status(503).send()
    })

});

app.post('/proyecto', (req, res) => {
    const {
        nombre,
        repositorio,
        rama,
        ruta_final,
        directorio_copiar,
        type
    } = req.body;

    if(!nombre || !repositorio || !rama || !ruta_final || !directorio_copiar || !type) return res.status(503).send();

    clientPS
    .query(`INSERT INTO proyectos (nombre, repositorio, rama, ruta_final, directorio_copiar, type) VALUES ($1, $2, $3, $4, $5, $6)`, [nombre, repositorio, rama, ruta_final, directorio_copiar, type])
    .then(response => {
        res.send()
    })
    .catch(err => {
        console.log(err)
        res.status(503).send()
    })
}) 

app.put('/proyecto/:id', (req, res) => {
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
})

app.get('/proyecto', (req, res) => {
    clientPS
    .query(`SELECT * FROM proyectos`)
    .then(response => {
        res.send(response.rows)
    })
    .catch(err => {
        console.log(err)
        res.status(503).send()
    })
})

app.listen(PORT, () => console.log(`PORT: ${PORT}`))