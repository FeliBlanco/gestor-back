const getData = async (req, res) => {
    try {
        res.send(req.user)
    }
    catch(err) {
        res.status(503).send()
    }
}

module.exports = getData;