import { SignedOut, SignedIn } from "@clerk/nextjs";
import Home from "@/components/home/home";
import ConnectSocialMedias from "@/components/connect-social-medias/connect-social-medias";
import { useEffect, useState } from "react";
import AnalyticsPage from "@/components/analytics/analytics";

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

const HomePage = () => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/connected-profiles",
        {
          method: "GET",
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <SignedOut>
        <Home />
      </SignedOut>
      <SignedIn>
        {data && <ConnectSocialMedias />}
        {!data && <AnalyticsPage />}
      </SignedIn>
    </>
  );
};

export default HomePage;
