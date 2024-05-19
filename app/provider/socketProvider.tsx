"use client";

import { createContext, useContext } from "react";
import io, { Socket } from "socket.io-client";
import { API_URL } from "../constants/URL";

interface Context {
  socket: Socket;
}

const socket = io(`${API_URL}`);

const SocketContext = createContext<Context>({
  socket,
});

function SocketProvider(props: any) {
  return <SocketContext.Provider value={{ socket }} {...props} />;
}

export const useSocket = () => useContext(SocketContext);

export default SocketProvider;
