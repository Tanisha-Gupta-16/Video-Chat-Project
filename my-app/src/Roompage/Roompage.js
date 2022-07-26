import React, { useEffect } from "react";
import ChatSection from "./ChatSection/ChatSection";
import ParticipantsSection from "./ParticipantsSection/ParticipantsSection";
import VideoSection from "./VideoSection/VideoSection";
import RoomLabel from "./RoomLabel";
import "./Roompage.css";
import { connect } from "react-redux";
import * as webRTCHandler from "../utils/webRTCHandler";
import Overlay from "./Overlay";
import { setShowOverlay } from "../store/actions";
const Roompage = ({
  roomId,
  identity,
  isRoomHost,
  showOverlay,
  connectOnlyWithAudio,
}) => {
  useEffect(() => {
    if (!isRoomHost && !roomId) {
      const siteUrl = window.location.origin;
      window.location.href = siteUrl;
    } else {
      webRTCHandler.getLocalPreviewInitRoomConnection(
        isRoomHost,
        identity,
        roomId,
        connectOnlyWithAudio
      );
    }
  }, []);
  return (
    <div className="room_container">
      <ParticipantsSection />
      <VideoSection />
      <ChatSection />
      <RoomLabel roomId={roomId} />
      {showOverlay && <Overlay />}
    </div>
  );
};

const mapStoreStateToProps = (state) => {
  return {
    ...state,
  };
};
export default connect(mapStoreStateToProps)(Roompage);
