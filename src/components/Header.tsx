import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import "../styles/Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faStickyNote,
  faBorderAll,
} from "@fortawesome/free-solid-svg-icons";

const Header: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();

  return (
    <header className="bg-custom-purple w-screen h-16 flex justify-between items-center px-14 mb-4">
      <Link href="/">
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

      {user ? (
        <div className="flex gap-12 items-center">
          <Link href="/planner">
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
          <Link href="/posts">
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
          <Link href="/connect-social-medias">
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

      {user ? (
        <div>
          <UserButton afterSignOutUrl="/" showName={true} />
        </div>
      ) : (
        <div className="flex gap-8">
          <Link href="/login">
            <a>
              <button className="">Login</button>
            </a>
          </Link>
          <Link href="/signup">
            <a>
              <button className="">Signup</button>
            </a>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
