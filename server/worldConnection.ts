import {
  WebSocket,
  isWebSocketCloseEvent,
} from 'https://deno.land/std@0.95.0/ws/mod.ts';
import { v4 } from 'https://deno.land/std@0.95.0/uuid/mod.ts';

interface ISocketMessage {
  msg: 'connected' | 'update';
}

interface IActivePlayer {
  username: string;
  websocket: WebSocket;
}

interface IServerActivePlayer extends IActivePlayer {
  websocket: WebSocket;
}

interface IConnected extends ISocketMessage {
  username: string;
}

// Create a map with all the currently connected players
let sockets = new Map<string, IActivePlayer>();

// Remove closed client to not send updates to clients no longer connected
// Send a message to the client to remove that player from world
const broadcastCloseEvent = (uuid: string) => {
  sockets.delete(uuid);
};

// Used for broadcasting that another user has connected to the world
const broadcastConnect = (obj: IConnected) => {
  console.log(`${obj.username} has connected to the server`);

  sockets.forEach((ws: IActivePlayer) => {
    ws.websocket.send(JSON.stringify(obj));
  });
};

// Used for broadcasting new game state changes to everyone connected
const broadcastUpdateState = (obj: unknown) => {};

// Sends out the currently active players name atm
// Should send out more later such as color, position, velocity etc...
// Might wanna make this into an async call to chain
const broadcastActivePlayers = (uuid: string, obj: IConnected) => {
  const newlyJoinedUser = sockets.get(uuid);
  try {
    newlyJoinedUser!.username = obj.username;
    if (sockets.size > 1) {
      console.log('Broadcasting active players');
      const usernames: string[] = [];
      sockets.forEach((value, key) => {
        if (key !== uuid) {
          usernames.push(value.username);
        }
      });
      newlyJoinedUser?.websocket.send(
        JSON.stringify({ msg: 'currentUsers', users: usernames })
      );
    }
  } catch (error) {
    console.log('No such user');
  }
};

const filterIncommingMessages = (obj: ISocketMessage, uuid: string) => {
  switch (obj.msg) {
    case 'connected':
      broadcastActivePlayers(uuid, obj as IConnected);
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
  // Add the new websocket connection to map to keep track of all connected users
  const uuid: string = v4.generate();
  sockets.set(uuid, { username: 'anonymous', websocket: ws });

  for await (const ev of ws) {
    if (isWebSocketCloseEvent(ev)) {
      broadcastCloseEvent(uuid);
    } else if (typeof ev === 'string') {
      let evObj = JSON.parse(ev);
      filterIncommingMessages(evObj, uuid);
    }
  }
};
