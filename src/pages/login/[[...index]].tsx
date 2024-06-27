import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="grid grid-cols-login gap-11 h-screen">
      <div className="bg-principal-color content-center">
        <img className="m-center p-10" src="/images/Iphone_mockup.png"></img>
      </div>
      <div className="self-center gap-1">
        <h1 className="text-6xl text-center mb-2">Welcome to SocialHall</h1>
        <div className="flex justify-center">
          <SignIn
            signUpUrl="/signup"
            fallbackRedirectUrl={"/"}
            appearance={{
              elements: {
                socialButtonsBlockButton: "text-white",
                formField: "mb-10",
                formFieldLabel: "text-lg text-white",
                formFieldAction:
                  "text-principal-color-active text-base hover:text-principal-color-hover",
                formFieldInput: "bg-custom-grey text-base border-none text-black",
                formButtonPrimary:
                  "bg-principal-color-active text-white text-lg border-none hover:bg-principal-color-hover ",
                footerActionLink:
                  "text-principal-color-active hover:text-principal-color-hover",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}