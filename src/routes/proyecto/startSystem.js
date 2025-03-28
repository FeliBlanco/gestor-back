const startSystem = (req, res) => {
    try {
        res.send()
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
}

module.exports = startSystem