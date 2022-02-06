'use strict';

const { text } = require('express');
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);

io.on('connection', function(socket) {
    socket.on('game-start', (config) => {
    });

    socket.on('disconnect', () => {
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