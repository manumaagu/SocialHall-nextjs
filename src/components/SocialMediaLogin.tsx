import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface Props {
  socialMediaName: string;
  icon: IconDefinition;
  authUrl: string;
}

const SocialMediaLogin: React.FC<Props> = ({
  socialMediaName,
  icon,
  authUrl,
}) => {
  async function handleClick() {
    const response = await fetch(authUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    window.location.href = json.url;
  }

  return (
    <div className="social-media-login-container">
      <p className="social-media-btn-title">
        Connect {socialMediaName} account
      </p>
      <div
        onClick={handleClick}
        className={`social-media-btn ${socialMediaName.toLowerCase()}`}
      >
        <div>Connect {socialMediaName}</div>
        <FontAwesomeIcon
          icon={icon}
          className={`social-media-btn-icon ${socialMediaName.toLowerCase()}`}
        />
      </div>
    </div>
  );
};

export default SocialMediaLogin; 
