const express = require('express');
const cors = require('cors');

require('./db.js')

const app = express();


app.use(cors());
app.use(express.json());

app.use('/', require('./routes/index.js'))

module.exports = app;