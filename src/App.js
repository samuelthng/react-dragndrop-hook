import React, { useState, useEffect, useReducer } from "react";
import socketIOClient from "socket.io-client";

import "./App.css";

import { SocketContext } from "./contexts/SocketContext";
import Download from "./components/Download";
import Upload from "./components/Upload";

function App() {
  // Socket store.
  const [socket, setSocket] = useState();

  // Reducer to handle callback functions registry for each socket message.
  const [socketHandler, handlerDispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "onUpload":
          if (state.upload.indexOf(action.payload) > -1) return state;
          return { ...state, upload: [...state.upload, action.payload] };
        case "onConnected":
          if (state.connected.indexOf(action.payload) > -1) return state;
          return { ...state, connected: [...state.connected, action.payload] };
        default:
          return state;
      }
    },
    {
      upload: [],
      connected: [
        ({ success }, socket) => {
          console.log("Connected", { socket, success });
          if (success) setSocket(socket);
        }
      ]
    }
  );

  // Connect to socketIO
  useEffect(() => {
    const newSocket = socketIOClient(":4001");
    if (newSocket) setSocket(newSocket);
  }, []);

  // Handle callback for when socketIO is connected
  useEffect(() => {
    if (socket) {
      socket.removeAllListeners();
      Object.keys(socketHandler).forEach(key => {
        socket.on(key, data => {
          socketHandler[key].forEach(cb => {
            if (typeof cb === "function") cb(data, socket);
            else if (typeof cb.current === "function") cb.current(data, socket);
          });
        });
      });
    }
  }, [socket, socketHandler]);

  return (
    <SocketContext.Provider value={{ socket, handlerDispatch }}>
      <main className="App">
        <Upload />
        <Download />
      </main>
    </SocketContext.Provider>
  );
}

export default App;
