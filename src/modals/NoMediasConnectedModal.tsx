import React from "react";
import Link from "next/link";

interface ConnectSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectSocialModal: React.FC<ConnectSocialModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="bg-black bg-opacity-50 absolute inset-0"
        onClick={onClose}
      ></div>
      <div className="bg-white p-6 rounded-lg shadow-lg relative z-10">
        <h2 className="text-lg font-semibold mb-4">
          Connect Social Media Accounts
        </h2>
        <p className="mb-4">
          Before scheduling content, please connect your social media accounts.
        </p>
        <div className="flex justify-center space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
          >
            Close
          </button>
          <Link href={"/connect-social-medias"}>
            <button className="bg-blue-500 hover:bg-blue-600 text-black font-bold py-2 px-4 rounded">
              Connect Social Media
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConnectSocialModal;
