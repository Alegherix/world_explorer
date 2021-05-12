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
class GameServer {
    constructor() {
        this.TICK_RATE = 30;
        this.sockets = new Map();
    }
    // Adds socket to constructor
    addSocket(socket, username) {
        console.log(username + ' has connected to the server');
        const defaultPosition = { x: 0, y: 5, z: 0 };
        this.sockets.set(socket.id, {
            username,
            socket,
            position: defaultPosition,
        });
    }
    broadcastIncomingUser(socket, username) {
        socket.broadcast.emit('userConnected', username);
        const currentUsersArray = [];
        this.sockets.forEach((activePlayer) => {
            const { socket } = activePlayer, rest = __rest(activePlayer, ["socket"]);
            currentUsersArray.push(rest);
        });
        // Send only to the given client
        socket.broadcast.to(socket.id).emit('currentUsers', currentUsersArray);
    }
    removeSocket(id) {
        this.sockets.delete(id);
    }
}
exports.default = GameServer;
//# sourceMappingURL=GameServer.js.map