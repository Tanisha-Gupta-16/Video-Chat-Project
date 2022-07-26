import React from "react";
import JoinRoomInputs from "./JoinRoomInputs";
import { connect } from "react-redux";
import { useState } from "react";
import OnlyWithAudioCheckbox from "./OnlyWithAudioCheckbox";
import {
  setConnectOnlyWithAudio,
  setIdentity,
  setRoomId,
} from "../store/actions";

import ErrorMessage from "./ErrorMessage";
import JoinRoomButtons from "./JoinRoomButtons";
import { useNavigate } from "react-router";
import { getRoomExists } from "../utils/api";
import "./JoinRoomPage.css";
const JoinRoomContent = (props) => {
  const {
    isRoomHost,
    setConnectOnlyWithAudio,
    connectOnlyWithAudio,
    setIdentityAction,
    setRoomIdAction,
  } = props;
  const [roomIdValue, setRoomIdValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    setIdentityAction(nameValue);
    if (isRoomHost) {
      createRoom();
    } else {
      await joinRoom();
    }
  };
  const joinRoom = async () => {
    const responseMessage = await getRoomExists(roomIdValue);
    const { roomExists, full } = responseMessage;
    if (roomExists) {
      if (full) {
        setErrorMessage("Meeting is full. Please try again later.");
      } else {
        setRoomIdAction(roomIdValue);
        navigate("/room");
      }
    } else {
      setErrorMessage("Meetings not found. Check your meeting id.");
    }
  };
  const createRoom = () => {
    navigate("/room");
  };
  return (
    <div>
      <JoinRoomInputs
        roomIdValue={roomIdValue}
        setRoomIdValue={setRoomIdValue}
        nameValue={nameValue}
        setNameValue={setNameValue}
        isRoomHost={isRoomHost}
      />
      <OnlyWithAudioCheckbox
        setConnectOnlyWithAudio={setConnectOnlyWithAudio}
        connectOnlyWithAudio={connectOnlyWithAudio}
      />
      <ErrorMessage errorMessage={errorMessage} />
      <JoinRoomButtons
        handleJoinRoom={handleJoinRoom}
        isRoomHost={isRoomHost}
      />
    </div>
  );
};
const mapStoreStateToProps = (state) => {
  return {
    ...state,
  };
};
const mapActionsToProps = (dispatch) => {
  return {
    setConnectOnlyWithAudio: (onlyWithAudio) =>
      dispatch(setConnectOnlyWithAudio(onlyWithAudio)),
    setIdentityAction: (identity) => dispatch(setIdentity(identity)),
    setRoomIdAction: (roomId) => dispatch(setRoomId(roomId)),
  };
};

export default connect(
  mapStoreStateToProps,
  mapActionsToProps
)(JoinRoomContent);
