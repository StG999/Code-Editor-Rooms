import { io, Socket } from 'socket.io-client';

export const initSocket = async () => { // Remove type annotations
    const options = {
      'force new connection': true,
      reconnectionAttempt: 'Infinity',
      timeout: 1000000,
      transports: ['websocket'],
    };
    return io("http://localhost:5000", options);
    
  };