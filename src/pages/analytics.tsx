import { SignedOut, SignedIn } from "@clerk/nextjs";
import Analytics from "@/components/analytics/analytics";
import Login from "@/components/login/login";

const AnalyticsPage = () => {
  return (
    <>
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        <Analytics />
      </SignedIn>
    </>
  );
};

export default AnalyticsPage;
