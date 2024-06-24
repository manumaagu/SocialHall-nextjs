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
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface IconMap {
  [key: string]: IconDefinition;
}

const ICONS: IconMap = {
  Twitter: faXTwitter,
  Facebook: faFacebookSquare,
  Instagram: faInstagram,
  Tiktok: faTiktok,
  Youtube: faYoutube,
  Linkedin: faLinkedin,
};

interface Profile {
  username: string;
  url?: string;
  date?: string;
  picture: string;
}

interface SocialMediaButtonProps {
  network: string;
  profile: Profile;
  onUpdate: () => void;
  onExpired?: () => void;
}

interface Time {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const SocialMediaConnected: React.FC<SocialMediaButtonProps> = ({
  network,
  profile,
  onUpdate: updateConnectedSocialMedias,
  onExpired = () => {},
}) => {
  const calculateTimeLeft = (): Time => {
    if (!profile.date) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const difference = Number(profile.date) - +new Date();
    let timeLeft: Time = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const { username, picture } = profile;
  const [timeLeft, setTimeLeft] = useState<Time>(calculateTimeLeft());

  const revokeSocialMedia = async (network: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/revoke/${network.toLowerCase()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevoke = async (network: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas desvincular tu cuenta de ${network}?`
    );
    if (confirmed) {
      await revokeSocialMedia(network);
      updateConnectedSocialMedias();
    }
  };

  const handleRedirect = () => {
    window.open(profile.url, "_blank");
  };

  useEffect(() => {
    if (network === "Linkedin" && profile.date) {
      const timer = setInterval(() => {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);
        if (
          newTimeLeft.days === 0 &&
          newTimeLeft.hours === 0 &&
          newTimeLeft.minutes === 0 &&
          newTimeLeft.seconds === 0
        ) {
          onExpired();
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [profile.date, network, onExpired]);

  const timerComponents: JSX.Element[] = [];

  if (timeLeft.days > 0) {
    timerComponents.push(
      <span key="days">
        {timeLeft.days} {timeLeft.days === 1 ? "day" : "days"}{" "}
      </span>
    );
  } else if (timeLeft.hours > 0) {
    timerComponents.push(
      <span key="hours">
        {timeLeft.hours} {timeLeft.hours === 1 ? "hour" : "hours"}{" "}
      </span>
    );
    if (timeLeft.minutes > 0) {
      timerComponents.push(
        <span key="minutes">
          {timeLeft.minutes} {timeLeft.minutes === 1 ? "minute" : "minutes"}{" "}
        </span>
      );
    }
  } else if (timeLeft.minutes > 0) {
    timerComponents.push(
      <span key="minutes">
        {timeLeft.minutes} {timeLeft.minutes === 1 ? "minute" : "minutes"}{" "}
      </span>
    );
    if (timeLeft.seconds > 0) {
      timerComponents.push(
        <span key="seconds">
          {timeLeft.seconds} {timeLeft.seconds === 1 ? "second" : "seconds"}{" "}
        </span>
      );
    }
  } else if (timeLeft.seconds > 0) {
    timerComponents.push(
      <span key="seconds">
        {timeLeft.seconds} {timeLeft.seconds === 1 ? "second" : "seconds"}{" "}
      </span>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <p className="social-media-btn-title">{network}</p>
          <FontAwesomeIcon
            className="text-2xl pl-2 mb-4"
            icon={ICONS[network]}
          />
        </div>
        {network === "Linkedin" && (
          <p className="mb-4">
            Reauthorization in: <b>{timerComponents}</b>
          </p>
        )}
      </div>
      <div className="flex p-4 h-26 items-center text-xl border-2 rounded border-black-light border-opacity-70 text-center justify-between bg-gray-light text-black">
        <div className="flex items-center flex-grow">
          <img
            className="rounded-full mr-4 max-h-12"
            src={picture}
            alt={`${network} profile`}
          />
          <p
            onClick={network !== "Linkedin" ? handleRedirect : undefined}
            className={network !== "Linkedin" ? "cursor-pointer" : ""}
          >
            {`Cuenta: `}
            <b>{username}</b>
          </p>
        </div>
        <FontAwesomeIcon
          icon={faTimes}
          className="text-2xl cursor-pointer flex-shrink-0 hover:text-custom-purple-dark-hover"
          onClick={() => handleRevoke(network)}
        />
      </div>
    </div>
  );
};

export default SocialMediaConnected;
