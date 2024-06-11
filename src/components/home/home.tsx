import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { faChartSimple } from "@fortawesome/free-solid-svg-icons";
import { faPen } from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
  return (
    <>
      <div className="homepage">
        <main>
          <section>
            <div className="text-center m-top">
              <h1 className=" text-5xl font-bold">Social Media Made Simple</h1>
              <h2 className="text-4xl">
                Streamline your social media management with our all-in-one
                platform. From scheduling posts to engaging with your audience,
                we&apos;ve got you covered.
              </h2>
            </div>
            <div className="grid grid-cols-2 mx-7 mt-28 ">
              <div className="flex flex-col">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl" />
                <div className="my-4">
                  <h3 className="text-2xl font-bold">Schedule posts</h3>
                  <h4 className="text-xl">
                    {" "}
                    Plan your content calendar and publish posts at the perfect
                    time.{" "}
                  </h4>
                </div>
                <FontAwesomeIcon icon={faChartSimple} className="text-4xl" />
                <div className="my-4">
                  <h3 className="text-2xl font-bold">Analytics</h3>
                  <h4 className="text-xl">
                    {" "}
                    Track engagement, follower growth, and post performance with
                    in-depth analytics.{" "}
                  </h4>
                </div>
                <FontAwesomeIcon icon={faPen} className="text-4xl" />
                <div className="my-4">
                  <h3 className="text-2xl font-bold">Content Creation</h3>
                  <h4 className="text-xl">
                    {" "}
                    Design stunning visuals and write compelling captions with
                    our integrated tools.{" "}
                  </h4>
                </div>
              </div>
              <div>
                <img src="https://placehold.jp/150x150.png"></img>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default HomePage;
