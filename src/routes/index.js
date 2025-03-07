const { Router } = require('express');

const router = Router();

router.use('/proyecto', require('./proyecto/index.js'));
router.use('/grupo', require('./grupo/index.js'));
router.use('/framework', require('./framework/index.js'));
router.use('/build', require('./build/index.js'));

module.exports = router;