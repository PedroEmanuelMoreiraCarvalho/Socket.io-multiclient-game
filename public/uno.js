var socket = io('http://localhost:4200/');

socket.on('connect', function(data) {
    socket.emit('join', 'Hello World from client');
});

const blockSize = 10;

//variáves:
var players = [];

var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

class Aplayer{
    constructor(x,y){
        this.x = x;
        this.y = y;
        createBlueSquare(x,y);
    }
    render(){
        createBlueSquare(this.getX(),this.getY());
    }
    getX(){
        return this.x;
    }
    getY(){
        return this.y;
    }
}

class Player{
    constructor(x,y){
        this.x = x;
        this.y = y;
        createRedSquare(x,y)
    }
    render(){
        createRedSquare(this.getX(),this.getY());
    }
    getX(){
        return this.x;
    }
    getY(){
        return this.y;
    }
    setX(newX){
        this.x = newX;
    }
    setY(newY){
        this.y = newY;
    }
}

let createRedSquare = ((x,y)=>{
    ctx.fillStyle="#FF0000";
    ctx.fillRect(x,y,10,10);
});

let createBlueSquare = ((x,y)=>{
    ctx.fillStyle="#2302FF";
    ctx.fillRect(x,y,10,10);
});

// inicializando player
player = new Player(20,10);

//FUNÇÕES:

//recebendo outros players já conectados

socket.on('addLastPlayers', function(server_players) {
    players.forEach(player_on_game => {
        server_players.forEach(players_on_server => {
            if(!(player_on_game==players_on_server)){
                players.push(player_on_game);
            }
        });
    });
});

//ao outro player conectar

socket.on('solicitePosition', function() {
    console.log('novo player adicionado');
    var author = socket.id;
    var pos = {
        author: author,
        x: player.getX(),
        y: player.getY()
    };
    socket.emit('emitPlayer',pos);
});

socket.on('instancePlayer', function(data){
    //console.log('posiçoes recebidas');
    //console.log('data',data);
    players.push(data);
    //console.log(players);
    
    var author = socket.id;
    
    var pos = {
        author: author,
        x: player.getX(),
        y: player.getY()
    };
    socket.emit('sendPosition',pos);
 });

//recebendo posição de outro player

socket.on('receivedPosition', function(position){
    if(!(socket.id==position['author'])){
        console.log(position);
        players.push(position);
        //console.log(players);
        players.forEach(a_player => {
            if(a_player['author']==position['author']){
                a_player['x']=position['x'];
                a_player['y']=position['y'];
            }
        });
    }
});

//pedindo atualização do sistema:
 
let requireupdate = (() =>{
    socket.emit('requireUpdate',null);
});

//movimentação insana
let playerUp = (() =>{
    player.setY(player.getY()-blockSize);
    updatePos();
});
let playerDown  = (() =>{
    player.setY(player.getY()+blockSize);
    updatePos();
});
let playerLeft = (() =>{
    player.setX(player.getX()-blockSize);
    updatePos();
});
let playerRight = (() =>{
    player.setX(player.getX()+blockSize);
    updatePos();
});

let clearScreen=(()=>
    ctx.clearRect(0, 0, c.width, c.height)
);

let gameRender = (()=>{
    clearScreen();
    player.render();
    players.forEach(a_player => {
        console.log(a_player['author']);
        if(a_player['author']!=undefined){
            if(!(socket.id==a_player['author'])){
            createBlueSquare(a_player['x'],a_player['y']);
        }}
    });
});

let updatePos = (()=>{
    var author = socket.id;
    var pos = {
        author: author,
        x: player.getX(),
        y: player.getY()
    };
    socket.emit('sendPosition', pos);
});

setInterval(function() {
    gameRender();
}, 100);   // fps = 10 frames per second