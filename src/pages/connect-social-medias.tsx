import { SignedOut, SignedIn } from "@clerk/nextjs";
import Home from "@/components/home/home";
import ConnectSocialMedias from "@/components/connect-social-medias/connect-social-medias";


const ConnectSocialMediasPage = () => {
  return (
    <>
      <SignedOut>
        <Home />
      </SignedOut>
      <SignedIn>
        <ConnectSocialMedias />
      </SignedIn>
    </>
  );
};

export default ConnectSocialMediasPage;
