import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACKEND_IP}`, {
  withCredentials: true,
  transports: ['websocket'], 

  
});

export default socket;
