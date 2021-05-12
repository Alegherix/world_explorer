"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import express from 'express';
// const app = express();
// import http from 'http';
// const server = http.createServer();
// import { Server } from 'socket.io';
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//   },
// });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const httpServer = http_1.default.createServer();
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*' },
});
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('userConnected', (message) => {
        console.log(message);
        io.emit('userConnected', message);
    });
});
httpServer.listen(8000, () => {
    console.log('Listening on http://localhost:8000');
});
//# sourceMappingURL=server.js.map