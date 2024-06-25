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
import Sidebar from "./Sidebar";

const Header: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
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
    <header className="bg-custom-purple w-screen min-h-16 flex justify-between items-center px-14 mb-4">
      <Link href="/" legacyBehavior>
        <a className="flex items-center gap-4">
          <img
            src="/images/SocialHall_Logo.png"
            alt="Logo"
            className="w-12 h-12"
          />
          <h1 className="text-4xl font-bold text-center text-black">
            <span className="lg:inline md:inline">SOCIALHALL</span>
          </h1>
        </a>
      </Link>

      {user ? (
        <div className="hidden md:flex md:flex-row md:gap-12 lg:gap-6">
          <Link href="/planner" legacyBehavior>
            <a
              className={`p-2 lg:overflow-hidden lg:whitespace-nowrap lg:text-ellipsis text-black ${
                router.pathname === "/planner"
                  ? "bg-custom-purple-dark text-black"
                  : "hover:bg-custom-purple-dark-hover hover:text-black justify-center"
              }`}
            >
              <button className="text-base p-1 rounded-lg h-full flex-grow">
                <FontAwesomeIcon icon={faCalendarAlt} className="inline lg:hidden lg:ml-4" />
                <span className="hidden lg:inline">Planner</span>
              </button>
            </a>
          </Link>
          <Link href="/posts" legacyBehavior>
            <a
              className={`p-2 lg:overflow-hidden lg:whitespace-nowrap lg:text-ellipsis ${
                router.pathname === "/posts"
                  ? "bg-custom-purple-dark text-black"
                  : "hover:bg-custom-purple-dark-hover hover:text-black text-black"
              }`}
            >
              <button className="text-base p-1 rounded-lg h-full flex-grow">
                <FontAwesomeIcon icon={faStickyNote} className="inline lg:hidden lg:ml-4" />
                <span className="hidden lg:inline">Posts</span>
              </button>
            </a>
          </Link>
          <Link href="/connect-social-medias" legacyBehavior>
            <a
              className={`p-2 lg:overflow-hidden lg:whitespace-nowrap lg:text-ellipsis text-black ${
                router.pathname === "/connect-social-medias"
                  ? "bg-custom-purple-dark text-black"
                  : "hover:bg-custom-purple-dark-hover hover:text-black"
              }`}
            >
              <button className=" text-base p-1 rounded-lg h-full flex-grow">
                <FontAwesomeIcon icon={faBorderAll} className="inline lg:hidden lg:ml-4" />
                <span className="hidden lg:inline">Connect Social Medias</span>
              </button>
            </a>
          </Link>
        </div>
      ) : null}

      {user ? (
        <div className="flex flex-row gap-4">
          <UserButton afterSignOutUrl="/" showName={!isMobile} />
          <div className="flex md:hidden">  
            <button onClick={toggleMenu} className="text-black text-3xl">
              <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="w-6" />
            </button>
          </div>
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

      <Sidebar isOpen={isOpen} closeMenu={closeMenu} />
    </header>
  );
};

export default Header;
