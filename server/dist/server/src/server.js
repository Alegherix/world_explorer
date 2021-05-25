"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const interfaces_1 = require("../../src/shared/interfaces");
const GameServer_1 = __importDefault(require("./GameServer"));
const httpServer = http_1.default.createServer();
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*' },
});
const port = process.env.PORT || 8000;
const gameServer = new GameServer_1.default(io);
io.on('connection', (socket) => {
    console.log(Object.keys(io.sockets.sockets));
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
httpServer.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map