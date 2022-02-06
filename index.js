'use strict';

const { text } = require('express');
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);

const FIELD_WIDTH = 1000, FIELD_HEIGHT = 1000;
class GameObject{
    constructor(obj={}){
        this.id = Math.floor(Math.random()*1000000000);
        this.x = obj.x;
        this.y = obj.y;
        this.z = obj.z;
        this.width = obj.width;
        this.height = obj.height;
        this.depth = obj.depth;
        this.angle = obj.angle;
        this.select = obj.select;
    }
    
    toJSON(){
        return {id: this.id, x: this.x, y: this.y, z: this.z, width: this.width, height: this.height, depth: this.depth,
            angle: this.angle, select: this.select};
    }
};

class Player extends GameObject{
    constructor(obj={}){
        super(obj);
        this.socketId = obj.socketId;
        this.nickname = obj.nickname;
        this.width = obj.size;
        this.height = obj.size;
        this.depth = obj.size;
        this.health = this.maxHealth = 30;
        this.bullets = {};
        this.teki_bullets = {};
        this.point = 0;
        this.kill = 0;
        this.sector = 1;
        this.movement = {};
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.z = 0;
        /*
        do{
            this.x = 0;
            this.y = 0;
            this.angle = 0;
        }while(this.intersectWalls());
        */
    }

    toJSON(){
        return Object.assign(super.toJSON(), {health: this.health, maxHealth: this.maxHealth, 
            socketId: this.socketId, point: this.point, kill:this.kill, nickname: this.nickname, sector: this.sector});
    }
};

let players = {};

io.on('connection', function(socket) {
    let player = null;
    socket.on('game-start', (config) => {
        player = new Player({
            socketId: socket.id,
            nickname: config.nickname,
            size: 80,
        });
        players[player.id] = player;
        //console.log('entry socketId = '+ player.socketId);
    });

    socket.on('disconnect', () => {
        if(!player){return;}
        delete players[player.id];
        player = null;
    });
});

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '/static/index.html'));
});


server.listen(process.env.PORT, function() {
  console.log('Starting server on port Heroku');
});

/*
server.listen(5000, function() {
    console.log('Starting server on port 5000');
  });
*/