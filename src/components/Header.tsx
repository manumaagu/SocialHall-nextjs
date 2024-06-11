import React, { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
// import "../styles/header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faStickyNote,
  faBorderAll,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const Header: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initial screen size
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="bg-custom-purple w-screen h-16 flex justify-between items-center px-14 mb-4">
      <Link href="/" legacyBehavior>
        <a className="flex items-center gap-4">
          <img
            src="/images/SocialHall_Logo.png"
            alt="Logo"
            className="w-12 h-12 invert"
          />
          <h1 className="text-4xl font-bold text-center text-white">
            SOCIALHALL
          </h1>
        </a>
      </Link>

      <div
      // className={` bg-custom-purple transform ${
      //   isOpen ? "translate-x-0" : ""
      // } transition-transform duration-300 ease-in-out z-50 md:static md:flex md:gap-12 md:items-center`}
      >
        {user ? (
          <div className="hidden md:flex md:flex-row md:gap-12">
            <Link href="/planner" legacyBehavior>
              <a
                className={`p-2 ${
                  router.pathname === "/planner"
                    ? "active"
                    : "hover:bg-custom-purple-dark-hover hover:text-white"
                }`}
              >
                <button className="text-2xl p-1 rounded-lg h-full flex-grow">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-4" />
                  Planner
                </button>
              </a>
            </Link>
            <Link href="/posts" legacyBehavior>
              <a
                className={`p-2 ${
                  router.pathname === "/posts"
                    ? "active"
                    : "hover:bg-custom-purple-dark-hover hover:text-white"
                }`}
              >
                <button className="text-2xl p-1 rounded-lg h-full flex-grow">
                  <FontAwesomeIcon icon={faStickyNote} className="mr-4" />
                  Posts
                </button>
              </a>
            </Link>
            <Link href="/connect-social-medias" legacyBehavior>
              <a
                className={`p-2 ${
                  router.pathname === "/connect-social-medias"
                    ? "active"
                    : "hover:bg-custom-purple-dark-hover hover:text-white"
                }`}
              >
                <button className="text-2xl p-1 rounded-lg h-full flex-grow">
                  <FontAwesomeIcon icon={faBorderAll} className="mr-4" />
                  Connect Social Medias
                </button>
              </a>
            </Link>
          </div>
        ) : null}
      </div>

      {user ? (
        <div>
          <UserButton afterSignOutUrl="/" showName={!isMobile} />
        </div>
      ) : (
        <div className="flex gap-8">
          <Link href="/login" legacyBehavior>
            <a>
              <button className="">Login</button>
            </a>
          </Link>
          <Link href="/signup" legacyBehavior>
            <a>
              <button className="">Signup</button>
            </a>
          </Link>
        </div>
      )}
      <div className="flex md:hidden">
        <button onClick={toggleMenu} className="text-white text-3xl">
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
        </button>
      </div>
      {isOpen && (
        <div className=" " ></div>
        )}
    </header>
  );
};

export default Header;
