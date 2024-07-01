import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookSquare,
  faXTwitter,
  faInstagram,
  faLinkedin,
  faTiktok,
  faYoutube,
  IconDefinition,
} from "@fortawesome/free-brands-svg-icons";
import SocialMediaTextarea from "../components/SocialMediaTextarea";
import {
  AllSocialMediaContent,
  SocialMediaContent,
  YoutubeContent,
  YoutubeContentType,
  TwitterContent,
} from "../interfaces/social-media";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  date: string;
  time: string;
  onTimeChange: (time: string) => void;
  socialMedias: string[];
  content: { [key: string]: SocialMediaContent };
  onContentChange: (AllSocialMediaContent: any) => void;
}

interface IconMap {
  [key: string]: IconDefinition;
}

const ICONS: IconMap = {
  twitter: faXTwitter,
  facebook: faFacebookSquare,
  instagram: faInstagram,
  tiktok: faTiktok,
  youtube: faYoutube,
  linkedin: faLinkedin,
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  date,
  time,
  onTimeChange,
  socialMedias,
  content,
  onContentChange,
}) => {
  useEffect(() => {
    if (!selectedNetwork) setSelectedNetwork(socialMedias[0]);
  }, [socialMedias]);

  const [selectedNetwork, setSelectedNetwork] = useState<string>(
    socialMedias[0]
  );

  if (!isOpen) return null;

  const handleIconClick = (network: string) => {
    setSelectedNetwork(network);
  };

  // function checkConditions(): boolean {
  //   let disabled = true;
  //   if (content.twitter) {
  //     if (Array.isArray(content.twitter)) {
  //       if (content.twitter.length === 0) {
          
  //         return true;
  //       }

  //       const twitterContentArray = content.twitter[0] as TwitterContent;
  //       if (twitterContentArray.text) {
  //         disabled = false;
  //       }
  //     } else {
  //       const twitterContent = content.twitter as TwitterContent;

  //       if (twitterContent.text) {
  //         disabled = false;
  //       }
  //     }

  //     if (content.youtube && !disabled) {
  //       const youtubeContent = content.youtube as YoutubeContent;
  //       console.log(youtubeContent.media);
  //       if (
  //         youtubeContent.media === null ||
  //         youtubeContent.media.name === "empty"
  //       ) {
  //         disabled = true;
  //       }
  //     }
  //   }
  //   return disabled;
  // }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-black overflow-y-scroll">
      <div
        className="bg-black bg-opacity-50 absolute inset-0"
        onClick={onClose}
      ></div>
      <div className="bg-white p-6 rounded-lg shadow-lg relative z-10 w-6/12">
        <h2 className="text-lg font-semibold mb-4">Schedule Post</h2>
        <div className="flex space-x-4 mb-4">
          {socialMedias.map((network) => (
            <FontAwesomeIcon
              key={network}
              icon={ICONS[network]}
              className={`text-2xl cursor-pointer ${
                selectedNetwork === network ? "opacity-100" : "opacity-40"
              }`}
              onClick={() => handleIconClick(network)}
            />
          ))}
        </div>
        <div className="flex justify-end items-center text-center">
          <input
            type="date"
            value={date}
            readOnly={true}
            className="mb-2 p-2 border rounded"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="mb-2 p-2 border rounded ml-2"
          />
        </div>
        <SocialMediaTextarea
          network={selectedNetwork}
          value={content}
          onChange={onContentChange}
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
          >
            Close
          </button>
          <button
            onClick={onSave}
            className={`hover:bg-blue-600 font-bold py-2 px-4 rounded text-white bg-principal-color
              
            `}
            // disabled={checkConditions()}
          >
            Save post
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
