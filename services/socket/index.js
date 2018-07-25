"use strict";

const io = require('socket.io')();
const events = require('./events');


io.of('/ventas').on('connection', socket => {
    events.ventas(socket);
});

io.of('/transporte').on('connection', socket => {
    events.transporte(socket);
});

io.of('/mantenimiento').on('connection', socket => {
    events.mantenimiento(socket);
});


module.exports = io;