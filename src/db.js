const { Client } = require('pg');

const clientPS = new Client({
    user: 'postgres',
    host: '149.50.144.176',
    database: 'gestor',
    password: 'sULaSplavaSTouSCAuDirESat',
    port: 5432,
});

clientPS.connect().then(() => console.log('Conexión exitosa a PostgreSQL')).catch(err => console.error('Error de conexión', err.stack));

module.exports = clientPS;