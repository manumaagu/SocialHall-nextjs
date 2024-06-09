import React from "react";
import SocialMediaTextareaYoutube from "./social-media-textarea/SocialMediaTextareaYoutube";
import SocialMediaTextareaTwitter from "./social-media-textarea/SocialMediaTextareaTwitter";
import SocialMediaTextareaLinkedin from "./social-media-textarea/SocialMediaTextareaLinkedin";
import {
  SocialMediaContent,
  AllSocialMediaContent,
  TwitterContent,
  LinkedinContent,
  YoutubeContent,
} from "../interfaces/social-media";

interface SocialMediaTextareaProps {
  network: string;
  value: AllSocialMediaContent;
  onChange: (content: AllSocialMediaContent) => void;
}

const SocialMediaTextarea: React.FC<SocialMediaTextareaProps> = ({
  network,
  value,
  onChange,
}) => {
  const handleChange = (content: SocialMediaContent) => {
    onChange({
      ...value,
      [network]: content,
    });
  };

  return (
    <div>
      {network === "twitter" && (
        <SocialMediaTextareaTwitter
          value={value.twitter as TwitterContent | TwitterContent[]}
          onContentChange={handleChange} 
        />
      )}
      {network === "linkedin" && (
        <SocialMediaTextareaLinkedin
          value={value.linkedin as LinkedinContent}
          onContentChange={handleChange}
        />
      )}
      {network === "youtube" && (
        <SocialMediaTextareaYoutube
          value={value.youtube as YoutubeContent}
          onContentChange={handleChange}
        />
      )}
    </div>
  );
};

export default SocialMediaTextarea;
