import React, { useState } from "react";
import SwitchImg from "../../resources/images/switchToScreenSharing.svg";
import LocalScreenSharingPreview from "./LocalScreenSharingPreview";
import * as webRTCHandler from "../../utils/webRTCHandler";
const constraints = {
  audio: false,
  video: false,
};
const SwitchToScreenSharingButton = () => {
  const [isScreenSharingActive, setIsScreenSharingActive] = useState(false);
  const [screenSharingStream, setScreenSharingStream] = useState(null);
  const handleScreenSharingToggle = async () => {
    if (!isScreenSharingActive) {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      } catch (err) {
        console.log("error occured in screen sharing");
      }
      if (stream) {
        setScreenSharingStream(stream);
        webRTCHandler.toggleScreenShare(isScreenSharingActive, stream);
        setIsScreenSharingActive(true);
        // execute a function to switch the video track
      }
    } else {
      // switch for video
      webRTCHandler.toggleScreenShare(isScreenSharingActive);
      setIsScreenSharingActive(false);
      // stop screen share stream
      screenSharingStream.getTracks().forEach((t) => t.stop());
      setScreenSharingStream(null);
    }

    // setIsScreenSharingActive(!isScreenSharingActive);
  };

  return (
    <div className="video_button_container">
      <img
        src={SwitchImg}
        onClick={handleScreenSharingToggle}
        className="video_button_image"
      ></img>
      {isScreenSharingActive && (
        <LocalScreenSharingPreview stream={screenSharingStream} />
      )}
    </div>
  );
};

export default SwitchToScreenSharingButton;
