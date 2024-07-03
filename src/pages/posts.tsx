import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import {
  faFacebookSquare,
  faXTwitter,
  faInstagram,
  faLinkedin,
  faTiktok,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import ReactLoading from "react-loading";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface SocialProfiles {
  twitter?: Profile;
  facebook?: Profile;
  instagram?: Profile;
  linkedin?: Profile;
  tiktok?: Profile;
  youtube?: Profile;
}

interface Profile {
  username: string;
  picture: string;
}

interface Data {
  profiles: SocialProfiles;
}

interface TwitterPost {
  id: string;
  text: string;
}

const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;

const PostPage = () => {
  const [profiles, setProfiles] = useState<Data | null>(null);
  const [posts, setPosts] = useState<TwitterPost[]>();
  const [loading, setLoading] = useState<Boolean>(true);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  const notifyDelete = () => toast.error("Post deleted successfully!");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${clientUrl}/api/auth/connected-profiles`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setProfiles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const connectedSocialNetworks = profiles
    ? Object.keys(profiles.profiles).filter(
        (network) => profiles.profiles[network as keyof SocialProfiles]
      )
    : [];

  const getSocialIcon = (network: string) => {
    switch (network) {
      case "twitter":
        return faXTwitter;
      case "facebook":
        return faFacebookSquare;
      case "instagram":
        return faInstagram;
      case "linkedin":
        return faLinkedin;
      case "tiktok":
        return faTiktok;
      case "youtube":
        return faYoutube;
      default:
        return faPen;
    }
  };

  async function getPosts(network: string) {
    setSelectedNetwork(network);
    setLoading(true);

    try {
      const response = await fetch(`${clientUrl}/api/posts/list/${network}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        setPosts([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(network: string, id: string): Promise<void> {
    setSelectedNetwork(network);

    const url = `${clientUrl}/api/posts/delete/${network}/${id}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      getPosts(network);
      notifyDelete();
    } catch (err) {
      console.error(err);
    }
  }

  async function seePost(network: string, id: string): Promise<void> {
    setSelectedNetwork(network);

    switch (network) {
      case "twitter":
        const username = profiles?.profiles.twitter?.username;
        window.open(`https://x.com/${username}/status/${id}`);
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/feed/update/${id}`);
        break;
      case "facebook":
        window.open(`https://www.facebook.com/${id}`);
        break;
      case "instagram":
        window.open(`https://www.instagram.com/p/${id}`);
        break;
      case "tiktok":
        window.open(`https://www.tiktok.com/@${id}`);
        break;
      case "youtube":
        window.open(`https://www.youtube.com/watch?v=${id}`);
        break;
      default:
        break;
    }
  }

  return (
    <div className="flex flex-col">
      <main className="flex flex-1">
        <div className="w-1/4 p-4 bg-gray-100 border-r-2 border-r-black-light mb-4">
          <h1 className="text-2xl font-bold mb-4 text-center">
            <span className="hidden md:inline md:truncate md:overflow-auto ">
              Social Media
            </span>
            <FontAwesomeIcon
              icon={faShareNodes}
              className="inline md:hidden"
              title="Social Media"
            />
          </h1>
          <div className="flex flex-col space-y-2 justify-center">
            {connectedSocialNetworks.length > 0 &&
              !loading &&
              connectedSocialNetworks.map((network) => (
                <button
                  key={network}
                  onClick={() => getPosts(network)}
                  className={`py-2 px-4 text-gray-800 rounded shadow bg-principal-color hover:bg-principal-color-hover hover:text-white ${
                    selectedNetwork === network
                      ? "bg-principal-color-active text-white hover:bg-principal-color-active-hover"
                      : "bg-principal-color"
                  }`}
                  title={network.charAt(0).toUpperCase() + network.slice(1)}
                >
                  <span className="hidden md:inline">
                    {network.charAt(0).toUpperCase() + network.slice(1)}
                  </span>
                  <FontAwesomeIcon
                    icon={getSocialIcon(network)}
                    className="ml-2"
                  />
                </button>
              ))}

            {connectedSocialNetworks.length <= 0 && !loading && (
              <Link
                href={"/connect-social-medias"}
                className="py-2 px-4 font-bold bg-principal-color text-center hover:bg-principal-color-hover hover:text-white rounded"
              >
                <button>Click here to connect social media</button>
              </Link>
            )}
            {loading && <ReactLoading type={"spin"} color={"#ffffff"} className="self-center" />}
          </div>
        </div>
        <div className="w-3/4 p-4">
          <h2 className="text-xl font-semibold mb-4 pl-3">
            {selectedNetwork
              ? `${
                  selectedNetwork.charAt(0).toUpperCase() +
                  selectedNetwork.slice(1)
                } Posts`
              : "Select a social network"}
          </h2>
          {!loading && (
            <div className="p-4 rounded h-full">
              {loading ? (
                <ReactLoading type={"spin"} color={"#ffffff"} />
              ) : selectedNetwork ? (
                posts?.length ? (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex mb-4 justify-between border-b pb-2"
                    >
                      <p>{post.text ? post.text : "No title, just media"}</p>
                      <div className="flex gap-3 ml-4">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-xl cursor-pointer flex-shrink-0 hover:text-blue"
                          onClick={() => seePost(selectedNetwork, post.id)}
                        />
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="text-xl cursor-pointer flex-shrink-0 hover:text-red-dark"
                          onClick={() => deletePost(selectedNetwork, post.id)}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No posts found</p>
                )
              ) : (
                <p>Please select a social network to view the posts.</p>
              )}
            </div>
          )}
          {loading && (
            <div className="w-3/4 p-4">
              <ReactLoading type={"spin"} color={"#ffffff"} />
            </div>
          )}
        </div>
      </main>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default PostPage;
