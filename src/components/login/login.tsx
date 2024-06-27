import { SignIn } from "@clerk/clerk-react";
// import styles from "@/styles/login.module.css";

const Login: React.FC = () => {
  return (
      <div className="grid grid-cols-login gap-11 h-screen">
        <div className="bg-principal-color content-center">
          <img className="m-center" src="/images/Iphone_mockup.png"></img>
        </div>
        <div className="self-center gap-1">
          <h1 className="text-6xl text-center">Welcome to SocialHall</h1>
          <div className="flex justify-center">
            <SignIn
              signUpUrl="/signup"
              redirectUrl={"/"}
              appearance={{
                elements: {
                  formField: "mb-10",
                  formFieldLabel: "text-lg",
                  formFieldAction:
                    "text-principal-color-active text-base hover:text-principal-color-hover",
                  formFieldInput: "bg-custom-grey text-base border-none",
                  formButtonPrimary:
                    "bg-principal-color-active text-white text-lg hover:bg-principal-color-hover",
                  footer: "justify-end",
                  footerActionLink:
                    "text-sm text-principal-color-active hover:text-principal-color-hover",
                  footerActionLongText: "text-sm",
                },
              }}
            />
          </div>
        </div>
      </div>
  );
};

export default Login;
