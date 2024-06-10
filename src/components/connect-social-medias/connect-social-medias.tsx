import React, { useState, useEffect } from "react";
import SocialMediaLogin from "../SocialMediaLogin";
import {
  faFacebookSquare,
  faXTwitter,
  faInstagram,
  faLinkedin,
  faTiktok,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { auth, currentUser } from "@clerk/nextjs/server";
import SocialMediaConnected from "../SocialMediaConnected";

interface SocialProfiles {
  twitter?: Profile;
  facebook?: Profile;
  instagram?: Profile;
  linkedin?: Profile;
  tiktok?: Profile;
  youtube?: Profile;
}

interface Profile {
  username: string;
  picture: string;
  date?: string;
}

interface Data {
  profiles: SocialProfiles;
}

const ConnectSocialMedias: React.FC = () => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkedinTokenExpired, setLinkedinTokenExpired] = useState(false);

  const fetchData = async () => {
    try {
      const token = await auth();
      const response = await fetch("http://localhost:3001/user/medias", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setData(data);
      Object.keys(data.profiles).forEach((key) => {
        if(key !== 'linkedin') return;
        if(data.profiles[key].date >= Date.now()) setLinkedinTokenExpired(false);
        else setLinkedinTokenExpired(true);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedinExpired = () => {
    setLinkedinTokenExpired(true);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const updateConnectedSocialMedias = () => {
    fetchData();
  };
  if (error) return <div>Error cargando los datos.</div>;

  return (
    <>
      {!loading && (
        <>
          <h1 className="text-6xl text-center mt-10">
            Conecta tus redes sociales
          </h1>
          <div className="flex flex-col items-center mt-8">
            <div className="grid grid-cols-2 gap-20 border-l border-r px-8">
              {data?.profiles.twitter ? (
                <SocialMediaConnected
                  network="Twitter"
                  profile={data.profiles.twitter}
                  onUpdate={updateConnectedSocialMedias}
                />
              ) : (
                <SocialMediaLogin
                  socialMediaName="Twitter"
                  icon={faXTwitter}
                  authUrl="http://localhost:3000/api/auth/twitter"
                />
              )}

              {data?.profiles.facebook ? (
                <SocialMediaConnected
                  network="Facebook"
                  profile={data.profiles.facebook}
                  onUpdate={updateConnectedSocialMedias}
                />
              ) : (
                <SocialMediaLogin
                  socialMediaName="Facebook"
                  icon={faFacebookSquare}
                  authUrl="http://localhost:3001/auth/facebook"
                />
              )}

              {data?.profiles.tiktok ? (
                <SocialMediaConnected
                  network="Tiktok"
                  profile={data.profiles.tiktok}
                  onUpdate={updateConnectedSocialMedias}
                />
              ) : (
                <SocialMediaLogin
                  socialMediaName="Tiktok"
                  icon={faTiktok}
                  authUrl="http://localhost:3001/auth/tiktok"
                />
              )}

              {data?.profiles.youtube ? (
                <SocialMediaConnected
                  network="Youtube"
                  profile={data.profiles.youtube}
                  onUpdate={updateConnectedSocialMedias}
                />
              ) : (
                <SocialMediaLogin
                  socialMediaName="Youtube"
                  icon={faYoutube}
                  authUrl="http://localhost:3001/auth/google"
                />
              )}

              {data?.profiles.instagram ? (
                <SocialMediaConnected
                  network="Instagram"
                  profile={data.profiles.instagram}
                  onUpdate={updateConnectedSocialMedias}
                />
              ) : (
                <SocialMediaLogin
                  socialMediaName="Instagram"
                  icon={faInstagram}
                  authUrl="http://localhost:3001/auth/instagram"
                />
              )}

              {data?.profiles.linkedin && !linkedinTokenExpired ? (
                <SocialMediaConnected
                  network="Linkedin"
                  profile={data.profiles.linkedin}
                  onUpdate={updateConnectedSocialMedias}
                  onExpired={handleLinkedinExpired}
                />
              ) : (
                <SocialMediaLogin
                  socialMediaName="Linkedin"
                  icon={faLinkedin}
                  authUrl="http://localhost:3000/api/auth/linkedin"
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ConnectSocialMedias;
