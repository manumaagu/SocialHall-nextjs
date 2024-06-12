import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="grid grid-cols-login gap-11 h-screen">
      <div className="bg-custom-purple content-center">
        <Image className="m-center" src="/images/Iphone_mockup.png" alt={""}/>
      </div>
      <div className="self-center gap-1">
        <h1 className="text-6xl text-center mb-2">Welcome to SocialHall</h1>
        <div className="flex justify-center">
          <SignIn
            signUpUrl="/signup"
            fallbackRedirectUrl={"/"}
            appearance={{
              elements: {
                formField: "mb-10",
                formFieldLabel: "text-lg",
                formFieldAction:
                  "text-custom-purple-dark text-base hover:text-custom-purple-dark-hover",
                formFieldInput: "bg-custom-grey text-base border-none",
                formButtonPrimary:
                  "bg-custom-purple-dark text-white text-lg border-none hover:bg-custom-purple-dark-hover ",

                footerActionLink:
                  "text-custom-purple-dark hover:text-custom-purple-dark-hover",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
