import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen } from "@fortawesome/free-solid-svg-icons";
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
import Link  from "next/link";

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

const PostPage = () => {
  const [profiles, setProfiles] = useState<Data | null>(null);
  const [posts, setPosts] = useState<TwitterPost[]>();
  const [loading, setLoading] = useState<Boolean>(true);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/auth/connected-profiles", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();;
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
      const response = await fetch(`http://localhost:3000/api/posts/list/${network}`, {
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

    const url = `http://localhost:3000/api/posts/delete/${network}/${id}`;

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

      if (response.ok) {
        getPosts(network);
      }
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
    <div className="h-screen flex flex-col">
      {!loading && (
        <main className="flex flex-1">
          <div className="w-1/4 p-4 bg-gray-100 border-r-2 border-r-black-light mb-4">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Social Media
            </h1>
            <div className="flex flex-col space-y-2 justify-center">
              {connectedSocialNetworks.length > 0 ? (
                connectedSocialNetworks.map((network) => (
                  <button
                    key={network}
                    onClick={() => getPosts(network)}
                    className={`py-2 px-4 text-gray-800 rounded bg-custom-purple hover:bg-custom-purple-dark-hover hover:text-white ${
                      selectedNetwork === network
                        ? "bg-custom-purple-dark text-white"
                        : "bg-custom-purple"
                    }`}
                  >
                    {network.charAt(0).toUpperCase() + network.slice(1)}
                    <FontAwesomeIcon
                      icon={getSocialIcon(network)}
                      className="ml-2"
                    />
                  </button>
                ))
              ) : (
                <Link href={"/connect-social-medias"}
                  className="py-2 px-4 font-bold bg-custom-purple text-center hover:bg-custom-purple-dark-hover hover:text-white rounded"
                >
                  <button>Click here to connect social media</button>
                </Link>
              )}
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
            <div className="bg-white p-4 rounded h-full">
              {loading ? (
                <ReactLoading type={"spin"} color={"#ffffff"} />
              ) : selectedNetwork ? (
                posts?.length ? (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex mb-4 justify-between border-b pb-2"
                    >
                      <p>{post.text}</p>
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
                <p>Please select a social network to view its posts.</p>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default PostPage;
