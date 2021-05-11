import {
  ISocketMessage,
  IPosition,
  IConnected,
  IClientUpdate,
  IUpdate,
  Update,
} from '../src/shared/interfaces.ts';
import {
  WebSocket,
  isWebSocketCloseEvent,
} from 'https://deno.land/std@0.95.0/ws/mod.ts';
import { v4 } from 'https://deno.land/std@0.95.0/uuid/mod.ts';

interface IActivePlayer {
  username: string;
  websocket: WebSocket;
  position: IPosition;
}

// Create a map with all the currently connected players
let sockets = new Map<string, IActivePlayer>();
let elapsedTime: number = new Date().getTime();
const TICK_RATE = 30;

// Remove closed client to not send updates to clients no longer connected
// Send a message to the client to remove that player from world
const broadcastCloseEvent = (uuid: string) => {
  console.log('Trying to send disconnect');

  const username = sockets.get(uuid)?.username;
  sockets.delete(uuid);
  const disconnectMsg: IConnected = {
    msg: 'disconnect',
    username: username || '',
  };
  sockets.forEach(async (player) => {
    await player.websocket.send(JSON.stringify(disconnectMsg));
  });
};

// Used for broadcasting that another user has connected to the world
const broadcastConnect = (obj: IConnected) => {
  console.log(`${obj.username} has connected to the server`);

  sockets.forEach(async (ws: IActivePlayer) => {
    try {
      await ws.websocket.send(JSON.stringify(obj));
    } catch {
      console.log('error from broadcasting connection');
    }
  });
};

// Broadcasts the current state of the game based on the Tick rate of server
const broadcastUpdateState = (uuid: string, obj: IClientUpdate) => {
  // Update position for whenever an update is sent from client
  sockets.get(uuid)!.position = obj.position;

  const currentTime = new Date().getTime();
  if (currentTime > elapsedTime + TICK_RATE) {
    const update: Update[] = [];
    sockets.forEach((player) => {
      // don't send websocket info to client
      const { websocket, ...relevant } = player;
      update.push(relevant);
    });

    const msg: IUpdate = { msg: 'update', update };
    try {
      sockets.forEach(async (player) => {
        if (!player.websocket.isClosed)
          await player.websocket.send(JSON.stringify(msg));
      });
    } catch (error) {
      console.log('Something went wrong when updating state: ', error);
    }

    // update the elapsed time
    elapsedTime = currentTime;
  }
};

// Sends out the currently active players name atm
// Should send out more later such as color, position, velocity etc...
// Might wanna make this into an async call to chain
const broadcastActivePlayers = async (uuid: string, obj: IConnected) => {
  const newlyJoinedUser = sockets.get(uuid);
  newlyJoinedUser!.username = obj.username;

  if (sockets.size > 1) {
    console.log('Broadcasting active players');
    const usernames: string[] = [];
    sockets.forEach((value, key) => {
      if (key !== uuid) {
        usernames.push(value.username);
      }
    });
    try {
      await newlyJoinedUser?.websocket.send(
        JSON.stringify({ msg: 'currentUsers', users: usernames })
      );
    } catch {
      console.log('Error caused by broadcasting active players');
    }
  }
};

const filterIncommingMessages = (obj: ISocketMessage, uuid: string) => {
  switch (obj.msg) {
    case 'connected':
      broadcastActivePlayers(uuid, obj as IConnected);
      broadcastConnect(obj as IConnected);
      break;
    case 'update':
      broadcastUpdateState(uuid, obj as IClientUpdate);
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
