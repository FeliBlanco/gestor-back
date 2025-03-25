const { Router } = require('express');

const router = Router();

router.use('/proyecto', require('./proyecto/index.js'));
router.use('/grupo', require('./grupo/index.js'));
router.use('/framework', require('./framework/index.js'));
router.use('/build', require('./build/index.js'));

/*

curl -X GET "https://api.cloudflare.com/client/v4/accounts/9aef30c3fb4050c8a6ca87606b52f19a/tokens/verify" \
     -H "Authorization: Bearer G6Dh-qXx16vdodet6nXzSdGHBApRqUozyLynsAAf" \
     -H "Content-Type:application/json"
     */
module.exports = router;