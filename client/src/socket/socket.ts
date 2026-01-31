import { io, Socket } from 'socket.io-client';

// Should be an environment variable in prod
const URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const socket: Socket = io(URL, {
    autoConnect: false
});
