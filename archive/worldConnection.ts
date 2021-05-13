// import {
//   ISocketMessage,
//   IPosition,
//   IConnected,
//   IClientUpdate,
//   IUpdate,
//   Update,
//   IDisconnected,
// } from '../src/shared/interfaces.ts';
// import {
//   WebSocket,
//   isWebSocketCloseEvent,
// } from 'https://deno.land/std@0.95.0/ws/mod.ts';
// import { v4 } from 'https://deno.land/std@0.95.0/uuid/mod.ts';

// interface IActivePlayer {
//   username: string;
//   websocket: WebSocket;
//   position: IPosition;
// }

// // Create a map with all the currently connected players
// let sockets = new Map<string, IActivePlayer>();
// let disconnectedUsers: string[] = [];
// let newlyConnectedUsers: string[] = [];

// let elapsedTime: number = new Date().getTime();

// const TICK_RATE = 30;

// // Remove closed client to not send updates to clients no longer connected
// // Send a message to the client to remove that player from world
// const broadcastCloseEvent = (uuid: string) => {
//   console.log('Trying to send disconnect');

//   // const username = sockets.get(uuid)?.username;
//   // sockets.delete(uuid);
//   // const disconnectMsg: IConnected = {
//   //   msg: 'disconnect',
//   //   username: username || '',
//   // };
//   // sockets.forEach(async (player) => {
//   //   try {
//   //     if (!player.websocket.isClosed)
//   //       await player.websocket.send(JSON.stringify(disconnectMsg));
//   //   } catch (error) {
//   //     console.log('Error :<');
//   //   }
//   // });
// };

// // Used for broadcasting that another user has connected to the world
// const broadcastConnect = (obj: IConnected) => {
//   console.log(`${obj.username} has connected to the server`);

//   sockets.forEach(async (ws: IActivePlayer) => {
//     try {
//       if (!ws.websocket.isClosed) await ws.websocket.send(JSON.stringify(obj));
//     } catch (error) {
//       console.log('error from broadcasting connection');
//     }
//   });
// };

// // Broadcasts the current state of the game based on the Tick rate of server
// const broadcastUpdateState = (uuid: string, obj: IClientUpdate) => {
//   // Update position for whenever an update is sent from client
//   sockets.get(uuid)!.position = obj.position;

//   const currentTime = new Date().getTime();
//   if (currentTime > elapsedTime + TICK_RATE) {
//     const update: Update[] = [];
//     sockets.forEach((player) => {
//       // don't send websocket info to client
//       const { websocket, ...relevant } = player;
//       update.push(relevant);
//     });

//     const msg: IUpdate = { msg: 'update', update };
//     try {
//       sockets.forEach(async (player) => {
//         if (!player.websocket.isClosed)
//           await player.websocket.send(JSON.stringify(msg));
//       });
//     } catch (error) {
//       console.log('Something went wrong when updating state: ', error);
//     }

//     // update the elapsed time
//     elapsedTime = currentTime;
//   }
// };

// const broadcastActivePlayers = async (uuid: string, obj: IConnected) => {
//   const newlyJoinedUser = sockets.get(uuid);
//   newlyJoinedUser!.username = obj.username;

//   if (sockets.size > 1) {
//     console.log('Broadcasting active players');
//     const usernames: string[] = [];
//     sockets.forEach(async (value, key) => {
//       if (key !== uuid) {
//         usernames.push(value.username);
//       }
//     });
//     try {
//       if (!newlyJoinedUser!.websocket.isClosed) {
//         await newlyJoinedUser?.websocket.send(
//           JSON.stringify({ msg: 'currentUsers', users: usernames })
//         );
//       }
//     } catch (error) {
//       console.log('Error caused by broadcasting active players');
//     }
//   }
// };

// const broadcastState = (uuid: string, obj: IClientUpdate) => {
//   //
//   const currentTime = new Date().getTime();
//   const runCondition = currentTime > elapsedTime + TICK_RATE;

//   if (disconnectedUsers.length > 0 && runCondition) {
//     const currentDisconnectedUsers = [...disconnectedUsers];
//     const msg: IDisconnected = {
//       msg: 'disconnect',
//       users: currentDisconnectedUsers,
//     };
//     updateOfDisconnects(msg)
//       .then(
//         () =>
//           // Remove users from disconnect that we looped over.
//           (disconnectedUsers = disconnectedUsers.filter(
//             (user) => !currentDisconnectedUsers.includes(user)
//           ))
//       )
//       .catch(() => {
//         console.log('Was rejected');
//       });
//   }

//   // Tell current activePlayers about the new clients
//   else if (newlyConnectedUsers.length > 0) {
//   } else {
//     console.log('Broadcast State not disconnect');
//     broadcastState(uuid, obj);
//   }
// };

// const updateOfDisconnects = async (msg: IDisconnected) => {
//   sockets.forEach(async (player, key) => {
//     console.log(`Sending update to ${player.username} of disconnects`);
//     await player.websocket.send(JSON.stringify(msg));
//   });
// };

// const filterIncommingMessages = (obj: ISocketMessage, uuid: string) => {
//   switch (obj.msg) {
//     case 'connected':
//       newlyConnectedUsers.push(uuid);
//       broadcastActivePlayers(uuid, obj as IConnected);
//       broadcastConnect(obj as IConnected);
//       break;
//     case 'update':
//       // broadcastUpdateState(uuid, obj as IClientUpdate);
//       broadcastState(uuid, obj as IClientUpdate);
//       break;
//     default:
//       console.log('Something went wrong, msg was sent improperly');
//       break;
//   }
// };

// export const worldConnection = async (ws: WebSocket) => {
//   // Add the new websocket connection to map to keep track of all connected users
//   const uuid: string = v4.generate();
//   sockets.set(uuid, {
//     username: 'anonymous',
//     websocket: ws,
//     position: { x: 0, y: 5, z: 0 },
//   });

//   console.log('Currently active player on server: ', sockets.size);

//   for await (const event of ws) {
//     if (isWebSocketCloseEvent(event)) {
//       disconnectedUsers.push(uuid);
//       sockets.delete(uuid);
//     } else if (typeof event === 'string') {
//       let evObj = JSON.parse(event);
//       filterIncommingMessages(evObj, uuid);
//     }
//   }
// };
