const express = require('express');
require('dotenv').config()
const { exec } = require('child_process');
const { Client } = require('pg');
const cors = require('cors');
const moment = require('moment')


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

const URL_PROYECTOS = "/home/proyectos/"

app.get('/framework', async (req, res) => {
    try {
        const result = await clientPS.query(`SELECT * FROM frameworks`, []);
        res.send(result.rows)
    }
    catch(err) {
        res.status(503).send()
    }
})

app.get('/grupo', async (req, res) => {
    try {
        const result = await clientPS.query(`SELECT * FROM grupos`, []);
        res.send(result.rows)
    }
    catch(err) {
        res.status(503).send()
    }
})

app.post('/grupo', async (req, res) => {
    try {
        if(!"nombre" in req.body) return res.status(401).send("nombre is required")
        const {
            nombre
        } = req.body;

        let usuario = nombre.replaceAll(' ', '-')
        const search = await clientPS.query(`SELECT id FROM grupos where usuario = $1`, [usuario]);
        if(search.rowCount != 0) {
            usuario = `${usuario}-${search.rowCount + 1}`
        }
        await clientPS.query(`INSERT INTO grupos (nombre, creador, usuario) VALUES ($1, 'Feli Blanco', $2)`, [nombre, usuario]);

        exec(`mkdir -p ${URL_PROYECTOS}${usuario}`, (error, stdout, stderr) => {
            if(error) {
                console.log("ERROR AL CREAR DIRECTORIO CREAR GRUPO")
                console.log(error)
            } else {

            }
        })

        res.send()
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
})


app.get('/actualizar/:id', async (req, res) => {
    const sistema = req.params.id;

    if(!sistema) return res.status(400).json({ error: 'Ingresa el ID del sistema' });

    const proyecto = await clientPS.query(`SELECT * FROM proyectos WHERE id = $1`, [sistema])
    if(proyecto.rowCount == 0) return res.status(503).send("No se encontró ningun proyecto")

    const data = proyecto.rows[0];

    const { repositorio, rama, ruta_final, directorio_copiar } = data;

    if(data.actualizando == 1) return res.status(401).send("Ya se está actualizando ese sistema")

    
    const search_ac = await clientPS.query(`SELECT * FROM proyectos WHERE actualizando != 0`, [])
    if(search_ac.rowCount != 0) return res.status(503).send("Ya hay un sistema actualizandose")

    const framework = await clientPS.query(`SELECT * FROM frameworks WHERE id = $1`, [data.framework])
    if(framework.rowCount == 0) return res.status(503).send("No se encontró el framework")

    const grupo = await clientPS.query(`SELECT * FROM grupos WHERE id = $1`, [data.grupo])
    if(grupo.rowCount == 0) return res.status(503).send("No se encontró el grupo")

    const tipo_sistema = framework.rows[0].tipo;
            
    if(tipo_sistema == "front")  {

        await clientPS.query(`UPDATE proyectos SET actualizando = 1 WHERE id = $1`, [data.id]);

        const child = exec(`rm -r /tmp/build_project2 && git clone ${repositorio} /tmp/build_project2 \
  && cd /tmp/build_project2 \
  && git checkout ${rama} \
  && docker run --rm \
    -v /tmp/build_project2:/app \
    -v ${URL_PROYECTOS}${grupo.rows[0].usuario}:/output \
    -w /app \
    node:18-alpine \
    sh -c "npm install --legacy-peer-deps && npm run build && cp -r front /output"`, (error, stdout, stderr) => { 
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
        })

        /*const child = exec(`bash /home/actualizadores/script.sh ${repositorio} ${rama} ${ruta_final} ${directorio_copiar}`, (error, stdout, stderr) => {
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
        });*/

        child.stdout.on('data', (data) => {
            console.log("--")
            console.log(data)
        });


    } else if(tipo_sistema == "back") {
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
});

app.post('/proyecto', async (req, res) => {
    const {
        nombre,
        git_repo,
        framework,
        rama,
        build_settings,
        enviroment_variables,
        grupo
    } = req.body;

    if(!nombre || !git_repo || !rama || !build_settings) return res.status(503).send();

    const {
        build_command,
        install_command,
        output_directory
    } = build_settings

    const fecha = moment().format('D/MM/YYYY')

    const usuario = nombre.replaceAll(' ', '-')


    let proyect_directory = usuario;

    const search_di = await clientPS.query(`SELECT id FROM proyectos WHERE proyect_directory = $1`, [usuario])
    if(search_di.rowCount > 0) {
        proyect_directory = `${usuario}-${search_di.rowCount + 1}`
    }

    const grupoData = await clientPS.query(`SELECT id, usuario FROM grupos WHERE id = $1`, [grupo])
    if(grupoData.rowCount == 0) return res.status(404).send("no se encontro grupo")

    clientPS
    .query(`
        INSERT INTO proyectos 
        (
        nombre,
        repositorio,
        rama,
        framework,
        fecha_creacion,
        usuario,
        build_command,
        install_command,
        output_directory,
        proyect_directory,
        grupo
        ) VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10,
         $11
         ) RETURNING id`, [
            nombre,
            git_repo,
            rama,
            framework,
            fecha,
            usuario,
            build_command,
            install_command,
            output_directory,
            proyect_directory,
            grupo
        ])
    .then(async response => {
        for(const env_var of enviroment_variables) {
            if(env_var.key.length > 0) {
                await clientPS.query(`INSERT INTO env_vars (proyecto, key, value) VALUES ($1, $2, $3)`, [response.rows[0].id, env_var.key, env_var.value])
            }
        }
        exec(`mkdir -p ${URL_PROYECTOS}${grupoData.rows[0].usuario}/${proyect_directory}`, (error, stdout, stderr) => {
            if(error) {
                console.log("ERROR AL CREAR DIRECTORIO CREAR PROYECTO")
                console.log(error)
            } else {

            }
        })
        res.send({usuario: usuario})
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

app.get('/proyecto/:grupo/:proyecto', async (req, res) => {
    const proyecto = req.params.proyecto;
    const grupo = req.params.grupo;
    try {
        const grupoData = await clientPS.query(`SELECT * FROM grupos WHERE usuario = $1`, [grupo])
        if(grupoData.rowCount == 0) return res.status(404).send()

        const result = await clientPS.query(`SELECT * FROM proyectos WHERE usuario = $1 AND grupo = $2`, [proyecto, grupoData.rows[0].id])
        if(result.rowCount == 0) return res.status(404).send()
        res.send(result.rows[0])
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
})

app.get('/grupo/:grupo', (req, res) => {
    const grupo = req.params.grupo;

    clientPS.query(`SELECT * FROM grupos WHERE usuario = $1`, [grupo])
    .then(response => {
        if(response.rowCount == 1) {
            res.send(response.rows[0])
        } else {
            res.status(404).send("no encontrado")
        }
    })
    .catch(err => {
        console.log(err)
        res.status(503).send()
    })
})

app.get('/proyecto/:grupo', (req, res) => {
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