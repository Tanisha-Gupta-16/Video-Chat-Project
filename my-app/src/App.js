import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Introductionpage from "./Introductionpage/Introductionpage";
import Roompage from "./Roompage/Roompage";
import JoinRoomPage from "./JoinRoomPage/JoinRoomPage";

import { connectWithSocketIOServer } from "./utils/wss";
import "./App.css";
function App() {
  useEffect(() => {
    connectWithSocketIOServer();
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/room" element={<Roompage />} />
        <Route path="/" element={<Introductionpage />} />
        <Route path="/join-room" element={<JoinRoomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
