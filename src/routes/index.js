const { Router } = require('express');

const router = Router();

router.use('/proyecto', require('./proyecto/index.js'));
router.use('/grupo', require('./grupo/index.js'));
router.use('/framwork', require('./framework/index.js'));

module.exports = router;