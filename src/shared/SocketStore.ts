import { writable } from 'svelte/store';
import { io, Socket } from 'socket.io-client';

interface ISocket {
  connectSocket: () => Socket;
  isConnected: () => boolean;
  disconnectSocket: () => void;
}

// GLÖM EJ ÄNDRA IFRÅN LOCALHOST TILL HEROKU
let socket: Socket;

const connectSocket = (): Socket => {
  socket = io('https://world-explorer-backend.herokuapp.com').connect();
  return socket;
};

const isConnected = (): boolean => {
  return socket?.connected;
};

const disconnectSocket = () => {
  socket.disconnect();
};

const LoaderStore = writable<ISocket>({
  connectSocket,
  isConnected,
  disconnectSocket,
});

export default LoaderStore;
