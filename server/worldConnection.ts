import {
  WebSocket,
  isWebSocketCloseEvent,
} from 'https://deno.land/std@0.95.0/ws/mod.ts';
import { v4 } from 'https://deno.land/std@0.95.0/uuid/mod.ts';

interface ISocketMessage {
  msg: 'connected' | 'update';
}

type Position = { x: number; y: number; z: number };

interface IActivePlayer {
  username: string;
  websocket: WebSocket;
  position: Position;
}

interface IConnected extends ISocketMessage {
  username: string;
}

interface IUpdate extends IConnected {
  position: Position;
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

// Used for broadcasting new game state changes to everyone connected etc
// TODO -> MIGHT wanna make this on a tick rate instead of whenever an update is passed from client
// Atm broadcasts an array of all connected players and their position whenever an incomming update is sent from client
const broadcastUpdateState = (uuid: string, obj: IUpdate) => {
  try {
    // Update position based on the update sent
    sockets.get(uuid)!.position = obj.position;

    // O(2n) atm
    // Populate array with all users and their position
    const update: any[] = [];
    sockets.forEach((player) => {
      // don't send websocket info to client
      const { websocket, ...relevant } = player;
      update.push(relevant);
    });

    const updateMsg = { msg: 'update', update };
    // Send all positions to every client, let them filter it themselves
    sockets.forEach((player) => {
      player.websocket.send(JSON.stringify(updateMsg));
    });
  } catch (error) {
    console.log(error);
  }
};

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
      broadcastUpdateState(uuid, obj as IUpdate);
      break;
    default:
      console.log('Something went wrong, msg was sent improperly');
      break;
  }
};

export const worldConnection = async (ws: WebSocket) => {
  // Add the new websocket connection to map to keep track of all connected users
  const uuid: string = v4.generate();
  sockets.set(uuid, {
    username: 'anonymous',
    websocket: ws,
    position: { x: 0, y: 5, z: 0 },
  });

  for await (const ev of ws) {
    if (isWebSocketCloseEvent(ev)) {
      broadcastCloseEvent(uuid);
    } else if (typeof ev === 'string') {
      let evObj = JSON.parse(ev);
      filterIncommingMessages(evObj, uuid);
    }
  }
};
