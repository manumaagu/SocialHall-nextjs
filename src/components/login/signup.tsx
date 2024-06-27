import { SignUp } from "@clerk/clerk-react";
import "../../styles/Login.css";

const Signup: React.FC = () => {

    return (
        
        <div className="grid grid-cols-login gap-11 h-screen">
            <div className="bg-principal-color content-center" >
                <img className="m-center"  src="https://placehold.jp/150x150.png"></img>
            </div>
            <div className="self-center gap-1">
                <h1 className="text-6xl text-center">Welcome to SocialHall</h1>
                <div className="flex justify-center" >
                    <SignUp signInUrl="/login" appearance={{
                        elements: {
                            formField: "mb-7",
                            formFieldLabel: "text-lg",
                            formFieldAction: "text-principal-color-active text-base hover:text-principal-color-hover",
                            formFieldInput: "bg-custom-grey text-base border-none",

                            formButtonPrimary: "bg-principal-color-active text-white text-lg hover:bg-principal-color-hover",

                            footer: "justify-end",
                            footerActionLink: "text-sm text-principal-color-active hover:text-principal-color-hover",
                            footerActionText: "text-sm"
                        },
                    }} />
                </div>
            </div>
        </div>
    );
};

export default Signup;