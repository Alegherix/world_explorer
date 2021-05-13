"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../../src/shared/interfaces");
class GameServer {
    constructor(server) {
        this.TICK_RATE = 15;
        this.sockets = new Map();
        this.elapsedTime = new Date().getTime();
        this.server = server;
    }
    // Adds socket to constructor
    addSocket(socket, username) {
        console.log(username + ' has connected to the server');
        const defaultPosition = { x: 0, y: 5, z: 0 };
        const velocity = null;
        this.sockets.set(socket.id, {
            username,
            id: socket.id,
            socket,
            position: defaultPosition,
            velocity,
        });
    }
    broadcastIncomingUser(incomingSocket, username) {
        incomingSocket.broadcast.emit(interfaces_1.SocketEvent.USER_CONNECTED, {
            username,
            id: incomingSocket.id,
        });
        const currentUsersArray = [];
        this.sockets.forEach((activePlayer) => {
            const { socket } = activePlayer, rest = __rest(activePlayer, ["socket"]);
            if (incomingSocket.id !== socket.id)
                currentUsersArray.push(rest);
        });
        if (currentUsersArray.length > 0) {
            // Send only to the given client
            console.log('Sending currentUsers to newly connected client');
            incomingSocket.emit(interfaces_1.SocketEvent.CURRENT_USERS, currentUsersArray);
        }
    }
    removeSocket(id) {
        this.sockets.delete(id);
        this.server.sockets.emit(interfaces_1.SocketEvent.USER_DISCONNECTED, id);
    }
    updateState(id, { position, velocity }) {
        const player = this.sockets.get(id);
        player.position = position;
        player.velocity = velocity;
        this.broadcastStateUpdates();
    }
    // // Broadcasts state updates every 30ms, and only if >1 player on server
    broadcastStateUpdates() {
        const currentTime = new Date().getTime();
        if (currentTime > this.elapsedTime + this.TICK_RATE &&
            this.sockets.size > 1) {
            const updateArray = [];
            this.sockets.forEach((player) => {
                const { socket } = player, rest = __rest(player, ["socket"]);
                updateArray.push(rest);
            });
            this.server.sockets.emit(interfaces_1.SocketEvent.UPDATE_STATE, updateArray);
            this.elapsedTime = currentTime;
        }
    }
}
exports.default = GameServer;
//# sourceMappingURL=GameServer.js.map