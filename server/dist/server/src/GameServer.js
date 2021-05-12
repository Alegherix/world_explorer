"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class GameServer {
    constructor() {
        this.TICK_RATE = 30;
        this.sockets = new Map();
    }
    addSocket(socket) {
        const id = uuid_1.v4();
        const defaultPosition = { x: 0, y: 5, z: 0 };
        this.sockets.set(id, { username: 'anonymous', position: defaultPosition });
    }
}
//# sourceMappingURL=GameServer.js.map