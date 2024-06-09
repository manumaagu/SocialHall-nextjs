import React, { useState, ChangeEvent, useEffect } from "react";
import { TwitterContent } from "../../interfaces/social-media";
import { faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SocialMediaTextareaTwitterProps {
  value: TwitterContent | TwitterContent[];
  onContentChange: (content: TwitterContent | TwitterContent[]) => void;
}

const SocialMediaTextareaTwitter: React.FC<SocialMediaTextareaTwitterProps> = ({
  value,
  onContentChange,
}) => {
  const initializeTweets = () => {
    if (value === undefined) return [];

    if (Array.isArray(value)) {
      return value.map((tweet) => tweet.text || "");
    } else if (value.text) {
      return [value.text];
    }
    return [];
  };

  const [text, setText] = useState<string>("");
  const [tweets, setTweets] = useState<string[]>(initializeTweets);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, 280);
    setText(newText);

    const updatedContent = [...tweets, newText];

    let newTweets: TwitterContent[] = [];

    for (const tweet of updatedContent) {
      newTweets.push({ text: tweet });
    }

    onContentChange(newTweets);
  };

  const addTweet = () => {
    if (text.trim() === "") return;

    setTweets([...tweets, text]);
    setText("");
  };

  const removeLastTweet = () => {
    const removedTweets = tweets.slice(0, -1);
    setTweets(removedTweets);

    let newTweets: TwitterContent[] = [];

    for (const tweet of removedTweets) {
      newTweets.push({ text: tweet });
    }

    onContentChange(newTweets);
  };

  return (
    <>
      <div>
        <label>Text:</label>
        {tweets.map((tweet, index) => (
          <div
            key={index}
            className="flex justify-between items-center w-full p-2 border rounded mb-2"
          >
            <span>
              <strong>{`Post ${index + 1}:`}</strong>
              {` ${tweet.length > 30 ? `${tweet.slice(0, 30)}...` : tweet}`}
            </span>
            {index === tweets.length - 1 && (
              <FontAwesomeIcon
                icon={faTimes}
                className="ml-2 cursor-pointer hover:text-red"
                onClick={removeLastTweet}
              />
            )}
          </div>
        ))}
        <textarea
          value={text}
          onChange={handleTextChange}
          className="w-full p-2 border rounded mb-4 min-h-52"
          maxLength={280}
          placeholder="Write your tweet here"
          required
        />

        <div className="flex justify-between">
          <button
            onClick={addTweet}
            className={`mt-4 p-2 bg-blue-500 rounded text-center  ${text.trim() === "" ? "bg-custom-grey-disabled" : "bg-custom-grey"}`}
            disabled={text.trim() === ""}
          >
            Add tweet <FontAwesomeIcon icon={faPlus} className="pl-1"/>
          </button>
          <div>{text.length}/280</div>
        </div>
      </div>
    </>
  );
};

export default SocialMediaTextareaTwitter;
