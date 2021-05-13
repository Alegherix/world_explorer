"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const GameServer_1 = __importDefault(require("./GameServer"));
const httpServer = http_1.default.createServer();
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*' },
});
const gameServer = new GameServer_1.default();
io.on('connection', (socket) => {
    socket.on('userConnected', (message) => {
        gameServer.addSocket(socket, message.username);
        gameServer.broadcastIncomingUser(socket, message.username);
    });
    socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
        gameServer.removeSocket(io, socket.id);
    }));
});
httpServer.listen(8000, () => {
    console.log('Listening on http://localhost:8000');
});
//# sourceMappingURL=server.js.map