import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faStickyNote,
  faBorderAll,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar: React.FC<{ isOpen: boolean; closeMenu: () => void }> = ({ isOpen, closeMenu }) => {
  const router = useRouter();

  return (
    <div
      className={`fixed h-screen bg-custom-purple right-0 top-12 w-80 max-w-full transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-200 ease-linear z-20`}
    >
      <div className="flex flex-col gap-5">
        <Link href="/planner" legacyBehavior>
          <a
            className={`p-2 ${
              router.pathname === "/planner"
                ? "active"
                : "hover:bg-custom-purple-dark-hover hover:text-white"
            }`}
            onClick={closeMenu}
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
            onClick={closeMenu}
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
            onClick={closeMenu}
          >
            <button className="text-2xl p-1 rounded-lg h-full flex-grow text-left">
              <FontAwesomeIcon icon={faBorderAll} className="mr-4" />
              Connect Social Medias
            </button>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
