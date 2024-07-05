import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  YoutubeContent,
  YoutubeContentType,
} from "../../interfaces/social-media";

interface SocialMediaTextareaYoutubeProps {
  value: YoutubeContent;
  onContentChange: (content: YoutubeContent) => void;
}

interface FileWithPreview extends File {
  preview: string;
}

const SocialMediaTextareaYoutube: React.FC<SocialMediaTextareaYoutubeProps> = ({
  value,
  onContentChange,
}) => {

  const initializeTitle = () => {
    if(value === undefined) return "";
    return value.title || "";
  }

  const initializeDescription = () => {
    if(value === undefined) return "";
    return value.description || "";
  }

  const initializeFile = () => {
    if(value === undefined) return null;

    return value.media
      ? {
          ...value.media,
          preview: URL.createObjectURL(value.media),
        }
      : null;
  }

  const initializeFileType = () => {
    if(value === undefined) return "video";
    return value.type || "video";
  }

  const [title, setTitle] = useState<string>(initializeTitle);
  const [description, setDescription] = useState<string>(initializeDescription);
  const [file, setFile] = useState<FileWithPreview | null>(initializeFile);
  const [fileType, setFileType] = useState<string>(initializeFileType);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onContentChange({
      title: e.target.value,
      description: description,
      type: fileType as YoutubeContentType,
      media: file as File,
    });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
    onContentChange({
      title: title,
      description: e.target.value,
      type: fileType as YoutubeContentType,
      media: file as File,
    });
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFileType(e.target.value);
    onContentChange({
      title: title,
      description: description,
      type: e.target.value as YoutubeContentType,
      media: file as File,
    });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one video.");
      return;
    }
    const newFile = acceptedFiles[0];
    if (newFile.type.startsWith("video/")) {
      const fileWithPreview: FileWithPreview = Object.assign(newFile, {
        preview: URL.createObjectURL(newFile),
      });
      setFile(fileWithPreview);
    } else {
      alert("You can only upload video files.");
    }
    onContentChange({
      title: title,
      description: description,
      type: fileType as YoutubeContentType,
      media: newFile as File,
    });
  };

  const handleDelete = () => {
    if (file) {
      URL.revokeObjectURL(file.preview);
      setFile(null);
      const emptyFile = new File([], "empty");
      onContentChange({
        title: title,
        description: description,
        type: fileType as YoutubeContentType,
        media: emptyFile,
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [],
    },
  });

  return (
    <>
      <div>
        <label>Title:</label>
        <input
          className="w-full p-2 border rounded mb-4"
          type="text"
          value={title}
          onChange={handleTitleChange}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          className="w-full p-2 border rounded mb-4 min-h-52"
          value={description}
          onChange={handleDescriptionChange}
          required
        />
      </div>
      <div>
        <label>File Type:</label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={fileType}
          onChange={handleFileTypeChange}
        >
          <option value="video">Video</option>
          <option value="short">Short</option>
        </select>
      </div>
      <div
        {...getRootProps()}
        className="border-dashed border-2 border-gray-400 rounded p-4 mb-8 text-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drag and drop here the files...</p>
        ) : (
          <p>Click here or drag and drop your files here</p>
        )}
      </div>
      <div className="flex flex-wrap">
        {file && (
          <div className="inline-block mr-4 mb-4">
            <video
              src={file.preview}
              className="w-32 h-32 object-cover rounded"
              controls
            />
            <button
              onClick={handleDelete}
              className="block mt-2 text-sm text-red-500"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SocialMediaTextareaYoutube;
