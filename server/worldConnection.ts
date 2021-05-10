import {
  WebSocket,
  isWebSocketCloseEvent,
} from 'https://deno.land/std@0.95.0/ws/mod.ts';
import { v4 } from 'https://deno.land/std@0.95.0/uuid/mod.ts';

interface ISocketMessage {
  msg: 'connected' | 'update';
}

interface IConnected extends ISocketMessage {
  user: string;
}

// Create a map with all the currently connected players
let sockets = new Map<string, WebSocket>();

// Remove closed client to not send updates to clients no longer connected
// Send a message to the client to remove that player from world
const broadcastCloseEvent = (uuid: string) => {
  sockets.delete(uuid);
};

// Used for broadcasting that another user has connected to the world
const broadcastConnect = (obj: IConnected) => {
  sockets.forEach((ws: WebSocket) => {
    ws.send(JSON.stringify(obj));
  });
};

// Used for broadcasting new game state changes to everyone connected
const broadcastUpdateState = (obj: unknown) => {};

const filterIncommingMessages = (obj: ISocketMessage) => {
  switch (obj.msg) {
    case 'connected':
      broadcastConnect(obj as IConnected);
      break;
    case 'update':
      broadcastUpdateState(obj);
      break;
    default:
      console.log('Something went wrong, msg was sent improperly');
      break;
  }
};

export const worldConnection = async (ws: WebSocket) => {
  for await (const ev of ws) {
    // Create an unique id for each connected client
    const uuid: string = v4.generate();
    sockets.set(uuid, ws);

    if (isWebSocketCloseEvent(ev)) {
      broadcastCloseEvent(uuid);
    }

    if (typeof ev === 'string') {
      let evObj = JSON.parse(ev);
      filterIncommingMessages(evObj);
    }
  }
};
