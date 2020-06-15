const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const middleware = require("./middleware/middleware");
const log = require("./utils/log");
const appRouter = require('./router/app.js')

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));
app.use(middleware.routeLog())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet());
app.use(cors())
app.use(appRouter)

var server = require('http').createServer(app);
var io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => log.success("listening on port " + PORT));

io.on('connection', function (socket) {
    log.socket("connected")

    socket.on('clientPing', (msg) => {
        socket.emit('serverPong', msg)
    });

    socket.on('download', (chunkSize) => {
        const data = crypto.randomBytes(chunkSize);
        socket.emit('download', data);
    });

    socket.on('upload', (data) => {
        socket.emit('upload', Date.now());
    });

    socket.on('disconnect', function () {
        log.socket("disconnected");
    })
});

app.use(function(req, res, next) {
    res.sendStatus(404);
});