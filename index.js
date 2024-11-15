const express = require('express');
require('dotenv').config()
const { exec } = require('child_process');

const app = express();
app.use(express.json());


const PORT = process.env.PORT || 3000;

const sistemas = [
    {
        id:2,
        nombre: "Cobranzas front",
        repositorio: "https://github.com/valentincabrera/cobranzas.front",
        rama: "main",
        ruta_final: "/home/proyectos/cobranzas/front",
        directorio_copiar: "build",
        type: 'front'
    },
    {
        id:2,
        nombre: "Gimnasio front",
        repositorio: "https://github.com/valentincabrera/gimnasio.front",
        rama: "main",
        ruta_final: "/home/proyectos/gimnasio/front",
        directorio_copiar: "build",
        type: 'front'
    },
    {
        id:3,
        nombre: "Gimnasio back",
        repositorio: "https://github.com/valentincabrera/gimnasio.back",
        rama: "main",
        ruta_final: "/home/proyectos/gimnasio/back",
        directorio_copiar: "",
        type: 'back'
    }
]

app.get('/actualizar-front', (req, res) => {
    const { sistema } = req.query;

    if(!sistema) return res.status(400).json({ error: 'Debes proporcionar la ruta del script' });

    const sistemaIndex = sistemas.findIndex(i => i.id == sistema);
    if(sistemaIndex != -1) {
        const { repositorio, rama, ruta_final, directorio_copiar } = sistemas[sistemaIndex];
        if(sistemas[sistemaIndex].type != "front")  {
            exec(`bash /home/actualizadores/script.sh ${repositorio} ${rama} ${ruta_final} ${directorio_copiar}`, (error, stdout, stderr) => {
                if(error) {
                    console.error(`Error ejecutando el script: ${error.message}`);
                    return res.status(500).json({ error: `Error: ${error.message}` });
                }
        
                if(stderr) {
                    console.warn(`Advertencias: ${stderr}`);
                }
                res.json({ output: stdout || stderr });
            });
        } else if(sistemas[sistemaIndex].type != "back") {
            exec(`cd ${ruta_final} && git pull && docker-compose up --build -d`, (error, stdout, stderr) => {
                if(error) {
                    console.error(`Error ejecutando el script: ${error.message}`);
                    return res.status(500).json({ error: `Error: ${error.message}` });
                }
        
                if(stderr) {
                    console.warn(`Advertencias: ${stderr}`);
                }
                res.json({ output: stdout || stderr });
            });
        } else {
            res.status(503).send("No se encontró que tipo de sistema es")
        }

    
    } else {
        res.status(503).send("No se encontró ningun sistema")
    }
});

app.get('/actualizar-back', (req, res) => {
    const { sistema } = req.query;

    if(!sistema) return res.status(400).json({ error: 'Debes proporcionar la ruta del script' });

    const ruta = "/home/"

    const repositorio = "https://github.com/valentincabrera/cobranzas.front"
    const rama ="main"
    const ruta_final = "/home/proyectos/cobranzas/front"
    const directorio = "build"

    exec(`bash /home/actualizadores/script.sh ${repositorio} ${rama} ${ruta_final} ${directorio}`, (error, stdout, stderr) => {
        if(error) {
            console.error(`Error ejecutando el script: ${error.message}`);
            return res.status(500).json({ error: `Error: ${error.message}` });
        }

        if(stderr) {
            console.warn(`Advertencias: ${stderr}`);
        }
        res.json({ output: stdout || stderr });
    });
});


app.listen(PORT, () => console.log(`PORT: ${PORT}`))