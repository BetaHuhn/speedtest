const express = require('express')
const crypto = require('crypto');
const router = express.Router()
const { sendResult } = require("../middleware/middleware");

router.get('/hello', async(req, res) => {
    sendResult(res, { 
        name: process.env.HOSTNAME,
        location: process.env.LOCATION
    }, 200)
});

router.get('/download', async(req, res) => {
    const chunkSize = req.query.chunkSize || req.body.chunkSize;
    const data = crypto.randomBytes(chunkSize);
    res.send(data);
})

router.post('/upload', async(req, res) => {
    res.send(Date.now());
})


module.exports = router