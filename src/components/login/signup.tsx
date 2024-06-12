import { SignUp } from "@clerk/clerk-react";
import "../../styles/Login.css";
import Image from "next/image";

const Signup: React.FC = () => {

    return (
        
        <div className="grid grid-cols-login gap-11 h-screen">
            <div className="bg-custom-purple content-center" >
                <Image className="m-center" src="https://placehold.jp/150x150.png" alt={""}/>
            </div>
            <div className="self-center gap-1">
                <h1 className="text-6xl text-center">Welcome to SocialHall</h1>
                <div className="flex justify-center" >
                    <SignUp signInUrl="/login" appearance={{
                        elements: {
                            formField: "mb-7",
                            formFieldLabel: "text-lg",
                            formFieldAction: "text-custom-purple-dark text-base hover:text-custom-purple-dark-hover",
                            formFieldInput: "bg-custom-grey text-base border-none",

                            formButtonPrimary: "bg-custom-purple-dark text-white text-lg hover:bg-custom-purple-dark-hover",

                            footer: "justify-end",
                            footerActionLink: "text-sm text-custom-purple-dark hover:text-custom-purple-dark-hover",
                            footerActionText: "text-sm"
                        },
                    }} />
                </div>
            </div>
        </div>
    );
};

export default Signup;