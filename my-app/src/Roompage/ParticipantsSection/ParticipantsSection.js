import React from "react";
import ParticipantsLabel from "./ParticipantsLabel";
import Participants from "./Participants";
import "../Roompage.css";
const ParticipantsSection = () => {
  return (
    <div className="participants_section_container">
      <ParticipantsLabel />
      <Participants />
    </div>
  );
};

export default ParticipantsSection;
