import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookSquare,
  faXTwitter,
  faInstagram,
  faLinkedin,
  faTiktok,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { Bar, Line } from "react-chartjs-2";
import { socialMediaColor } from "../utils/event";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

interface PostAnalytics {
  date: string;
  impressions: number;
  retweets: number;
  likes: number;
  comments: number;
}

interface AnalyticsData {
  followers: Array<{ date: string; count: number }>;
  posts: PostAnalytics[];
}

interface Analytics {
  network: string;
  data: AnalyticsData[];
}

type ChartDataType = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
  }[];
};

const initialChartData: ChartDataType = {
  labels: [],
  datasets: [],
};

const AnalyticsPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("followers");
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [chartData, setChartData] = useState<ChartDataType>(initialChartData);
  const [chartType, setChartType] = useState<string>("line" as "line" | "bar");
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const response = await fetch("http://localhost:3001/user/medias", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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

  const connectedSocialNetworks = profiles
    ? Object.keys(profiles.profiles).filter(
        (network) => profiles.profiles[network as keyof SocialProfiles]
      )
    : [];

  const handleMetricChange = (metric: number) => {
    switch (metric) {
      case 1:
        setSelectedMetric("followers");
        break;
      case 2:
        setSelectedMetric("impressions");
        break;
      case 3:
        setSelectedMetric("likes");
        break;
      case 4:
        setSelectedMetric("comments");
        break;
      case 5:
        setSelectedMetric("posts");
        break;
    }
  };

  const handleNetworkClick = async (network: string) => {
    setSelectedNetwork(network);

    if (analytics.some((analytic) => analytic.network === network)) {
      handleSelectedNetworks(network);
      return;
    }

    const token = await getToken();

    const response = await fetch(`http://localhost:3001/analytics/${network}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const newAnalytics = {
      network: network,
      data: await response.json(),
    };

    setAnalytics((prevAnalytics) => [...prevAnalytics, newAnalytics]);

    handleSelectedNetworks(network);
  };

  const handleSelectedNetworks = (network: string) => {
    setSelectedNetworks((prevNetworks) => {
      if (prevNetworks.includes(network)) {
        return prevNetworks.filter((n) => n !== network);
      } else {
        return [...prevNetworks, network];
      }
    });
  };

  const fillChartData = () => {
    const selectedData = analytics.filter((entry) =>
      selectedNetworks.includes(entry.network)
    );

    const newLabels: string[] = [];
    const datasets: {
      label: string;
      data: number[];
      fill: boolean;
      borderColor: string;
      backgroundColor?: string;
      tension: number;
      postCount?: { [date: string]: number };
    }[] = [];

    selectedData.forEach((entry) => {
      switch (selectedMetric) {
        case "followers":
          console.log(entry.data);
          const followers: Array<{ date: string; count: number }> =
            entry.data[0].followers;
          const formattedFollowers = followers.map((dataEntry) => {
            const date = new Date(dataEntry.date);
            const formattedDate = date.toLocaleDateString("es-ES", {
              month: "short",
              day: "numeric",
            });
            newLabels.push(formattedDate);
            return dataEntry.count;
          });

          datasets.push({
            label:
              entry.network.charAt(0).toUpperCase() + entry.network.slice(1),
            data: formattedFollowers,
            fill: false,
            borderColor: socialMediaColor(entry.network),
            backgroundColor:
              chartType === "bar" ? socialMediaColor(entry.network) : undefined,
            tension: 0.1,
          });
          break;
        case "impressions":
          const statisticsImpression = entry.data[0].posts;
          const impressions: { [date: string]: number } = {};
          const postCountImpressions: { [date: string]: number } = {};

          statisticsImpression.forEach(
            (statistic: { date: string; impressions: number }) => {
              const date = new Date(statistic.date);
              const formattedDate = date.toISOString().slice(0, 10);
              if (impressions[formattedDate]) {
                impressions[formattedDate] += statistic.impressions;
                postCountImpressions[formattedDate] += 1;
              } else {
                impressions[formattedDate] = statistic.impressions;
                postCountImpressions[formattedDate] = 1;
              }
            }
          );

          const formattedImpressions = Object.keys(impressions).map((date) => {
            newLabels.push(
              new Date(date).toLocaleDateString("es-ES", {
                month: "short",
                day: "numeric",
              })
            );
            return impressions[date];
          });

          datasets.push({
            postCount: postCountImpressions,
            label:
              entry.network.charAt(0).toUpperCase() + entry.network.slice(1),
            data: formattedImpressions,
            fill: false,
            borderColor: socialMediaColor(entry.network),
            backgroundColor:
              chartType === "bar" ? socialMediaColor(entry.network) : undefined,
            tension: 0.1,
          });

          break;
        case "likes":
          const statisticsLikes = entry.data[0].posts;
          const likes: { [date: string]: number } = {};
          const postCountLikes: { [date: string]: number } = {};

          statisticsLikes.forEach(
            (statistic: { date: string; likes: number }) => {
              const date = new Date(statistic.date);
              const formattedDate = date.toISOString().slice(0, 10);
              if (likes[formattedDate]) {
                likes[formattedDate] += statistic.likes;
                postCountLikes[formattedDate] += 1;
              } else {
                likes[formattedDate] = statistic.likes;
                postCountLikes[formattedDate] = 1;
              }
            }
          );

          const formattedLikes = Object.keys(likes).map((date) => {
            newLabels.push(
              new Date(date).toLocaleDateString("es-ES", {
                month: "short",
                day: "numeric",
              })
            );
            return likes[date];
          });

          datasets.push({
            postCount: postCountLikes,
            label:
              entry.network.charAt(0).toUpperCase() + entry.network.slice(1),
            data: formattedLikes,
            fill: false,
            borderColor: socialMediaColor(entry.network),
            backgroundColor:
              chartType === "bar" ? socialMediaColor(entry.network) : undefined,
            tension: 0.1,
          });

          break;
        case "comments":
          const statisticsComments = entry.data[0].posts;
          const comments: { [date: string]: number } = {};
          const postCountComments: { [date: string]: number } = {};

          statisticsComments.forEach(
            (statistic: { date: string; comments: number }) => {
              const date = new Date(statistic.date);
              const formattedDate = date.toISOString().slice(0, 10);
              if (comments[formattedDate]) {
                comments[formattedDate] += statistic.comments;
                postCountComments[formattedDate] += 1;
              } else {
                comments[formattedDate] = statistic.comments;
                postCountComments[formattedDate] = 1;
              }
            }
          );

          const formattedComments = Object.keys(comments).map((date) => {
            newLabels.push(
              new Date(date).toLocaleDateString("es-ES", {
                month: "short",
                day: "numeric",
              })
            );
            return comments[date];
          });

          datasets.push({
            postCount: postCountComments,
            label:
              entry.network.charAt(0).toUpperCase() + entry.network.slice(1),
            data: formattedComments,
            fill: false,
            borderColor: socialMediaColor(entry.network),
            tension: 0.1,
          });
          break;
        case "posts":
          const statisticsPosts = entry.data[0].posts;
          const posts: { [date: string]: number } = {};

          statisticsPosts.forEach((statistic: { date: string }) => {
            const date = new Date(statistic.date);
            const formattedDate = date.toISOString().slice(0, 10);
            if (posts[formattedDate]) {
              posts[formattedDate] += 1;
            } else {
              posts[formattedDate] = 1;
            }
          });

          const formattedPosts = Object.keys(posts).map((date) => {
            newLabels.push(
              new Date(date).toLocaleDateString("es-ES", {
                month: "short",
                day: "numeric",
              })
            );
            return posts[date];
          });

          datasets.push({
            label:
              entry.network.charAt(0).toUpperCase() + entry.network.slice(1),
            data: formattedPosts,
            fill: false,
            borderColor: socialMediaColor(entry.network),
            backgroundColor:
              chartType === "bar" ? socialMediaColor(entry.network) : undefined,
            tension: 0.1,
          });
          break;
      }
    });

    setChartData({
      labels: Array.from(new Set(newLabels)),
      datasets: datasets,
    });
  };

  useEffect(() => {
    if (selectedNetworks.length === 0) {
      setChartData(initialChartData);
      return;
    }
    fillChartData();
  }, [selectedMetric, selectedNetworks, chartType]);

  const convertLabelToISODate = (label: string): string => {              // Move to utils
    const [day, month] = label.split(" ");
    const months: { [key: string]: string } = {
      ene: "01",
      feb: "02",
      mar: "03",
      abr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      ago: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dic: "12",
    };

    const currentYear = new Date().getFullYear();
    const monthNumber = months[month.toLowerCase()];

    return `${currentYear}-${monthNumber}-${day.padStart(2, "0")}`;
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const postCount =
              context[0].chart.config._config.data.datasets[0].postCount;
            if (!postCount) return context[0].label;
            return (
              context[0].label +
              " - " +
              postCount[convertLabelToISODate(context[0].label)] +
              " posts"
            );
          },
        },
      },
    },
  };

  return (
    <div className="h-screen flex flex-col">
      {!loading && (
        <main className="flex flex-1">
          <div className="w-1/4 p-4 bg-gray-100 border-r-2 border-r-black-light mb-4">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Social Media
            </h1>
            <div className="flex flex-col space-y-2">
              {connectedSocialNetworks.length > 0 ? (
                connectedSocialNetworks.map((network) => (
                  <button
                    key={network}
                    onClick={() => handleNetworkClick(network)}
                    className={`py-2 px-4 text-gray-800 rounded shadow bg-custom-purple hover:bg-custom-purple-dark-hover hover:text-white ${
                      selectedNetworks?.includes(network)
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
                  <button className="">
                    Click here to connect social media
                  </button>
                </Link>
              )}
            </div>
          </div>
          <div className="w-3/4 p-4">
            <div className="flex justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setChartType("line")}
                  className={`${
                    chartType === "line"
                      ? "bg-custom-purple-dark text-white"
                      : "bg-custom-purple text-white"
                  } py-2 px-4 rounded`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`${
                    chartType === "bar"
                      ? "bg-custom-purple-dark text-white"
                      : "bg-custom-purple text-white"
                  } py-2 px-4 rounded`}
                >
                  Bar
                </button>
              </div>
              <div className="flex flex-grow justify-end gap-8 mr-4">
                <button
                  onClick={() => handleMetricChange(1)}
                  className={` ${
                    selectedMetric === "followers"
                      ? "text-lg font-bold underline"
                      : ""
                  }`}
                >
                  Followers
                </button>
                <button
                  onClick={() => handleMetricChange(2)}
                  className={` ${
                    selectedMetric === "impressions"
                      ? "text-lg font-bold underline"
                      : ""
                  }`}
                >
                  Impressions
                </button>
                <button
                  onClick={() => handleMetricChange(3)}
                  className={` ${
                    selectedMetric === "likes"
                      ? "text-lg font-bold underline"
                      : ""
                  }`}
                >
                  Likes
                </button>
                <button
                  onClick={() => handleMetricChange(4)}
                  className={` ${
                    selectedMetric === "comments"
                      ? "text-lg font-bold underline"
                      : ""
                  }`}
                >
                  Comments
                </button>
                <button
                  onClick={() => handleMetricChange(5)}
                  className={` ${
                    selectedMetric === "posts"
                      ? "text-lg font-bold underline"
                      : ""
                  }`}
                >
                  Posts
                </button>
              </div>
            </div>
            <div className="bg-white p-4 rounded w-full h-80vh">
              {(chartType === "line" && (
                <Line
                  data={chartData}
                  options={chartOptions}
                  updateMode="show"
                />
              )) ||
                (chartType === "bar" && (
                  <Bar
                    data={chartData}
                    options={chartOptions}
                    updateMode="show"
                  />
                ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default AnalyticsPage;
