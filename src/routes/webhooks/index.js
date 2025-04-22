const { Router } = require('express');
const webhookMeta = require('./webhookMeta');
const webhookMetaPost = require('./webhookMetaPost');
const getConfig = require('./getConfig');
const updateConfig = require('./updateConfig');

const app = Router();


app.get('/', webhookMeta)
app.get('/config', getConfig)
app.put('/config', updateConfig)
app.post('/', webhookMetaPost)

module.exports = app;