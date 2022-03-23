const express = require("express");
const path = require("path");

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res)=>{
    res.render('index.html');
});

const port = 4200;

var sockets = [];
var players = [];

io.on("connection", (socket) =>{
    sockets.push(socket);
    socket.broadcast.emit('solicitePosition', null);
    socket.broadcast.emit('addLastPlayers', players);
    console.log("Sockets conectados:"+sockets.length);

    socket.on('emitPlayer', data =>{
        players.push(data);
        socket.broadcast.emit('instancePlayer', data);
    });

    socket.on('sendPosition', data =>{
        socket.broadcast.emit('receivedPosition', data);
    });
});

server.listen(port);