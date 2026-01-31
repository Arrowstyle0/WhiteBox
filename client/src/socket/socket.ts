import { io, Socket } from 'socket.io-client';

// Should be an environment variable in prod
// Should be an environment variable in prod, or undefined to use window.location
const URL = import.meta.env.VITE_API_URL || undefined;

export const socket: Socket = io(URL, {
    autoConnect: false
});
