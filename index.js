const express = require('express');
require('dotenv').config()
const { exec } = require('child_process');

const app = express();
app.use(express.json());


const PORT = process.env.PORT || 3000;

app.get('/actualizarsv', (req, res) => {
    const { scriptPath } = req.body;

    if(!scriptPath) return res.status(400).json({ error: 'Debes proporcionar la ruta del script' });

    exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
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