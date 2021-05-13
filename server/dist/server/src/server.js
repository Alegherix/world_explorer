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
const interfaces_1 = require("../../src/shared/interfaces");
const GameServer_1 = __importDefault(require("./GameServer"));
const httpServer = http_1.default.createServer();
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*' },
});
const gameServer = new GameServer_1.default(io);
io.on('connection', (socket) => {
    socket.on('userConnected', (message) => {
        gameServer.addSocket(socket, message.username);
        gameServer.broadcastIncomingUser(socket, message.username);
    });
    socket.on('disconnect', () => {
        gameServer.removeSocket(socket.id);
    });
    socket.on(interfaces_1.SocketEvent.UPDATE_STATE, (state) => {
        gameServer.updateState(socket.id, state);
    });
});
httpServer.listen(8000, () => {
    console.log('Listening on http://localhost:8000');
});
//# sourceMappingURL=server.js.map