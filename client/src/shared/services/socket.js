import { io } from 'socket.io-client';
import { API_URL } from './config';

const socket = io(API_URL.replace('/api', ''), {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
