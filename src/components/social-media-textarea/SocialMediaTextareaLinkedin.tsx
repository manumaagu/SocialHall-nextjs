import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  LinkedinContent,
  shareMediaCategory,
} from "../../interfaces/social-media";

interface SocialMediaTextareaLinkedinProps {
  value: LinkedinContent;
  onContentChange: (content: LinkedinContent) => void;
}

interface FileWithPreview extends File {
  preview: string;
}

const SocialMediaTextareaLinkedin: React.FC<
  SocialMediaTextareaLinkedinProps
> = ({ value, onContentChange }) => {
  const initializeFiles = (): FileWithPreview[] => {
    if (!value || !value.media) return [];

    const media = [] ;

    for (const file of value.media ?? []) {

      media.push({
        ...file,
        preview: URL.createObjectURL(file),
      });
    }

    return media as FileWithPreview[];
  };

  const initializeShareCommentary = () => {
    if (value === undefined) return "";
    return value.shareCommentary || "";
  };

  const [shareCommentary, setShareCommentary] = useState<string>(
    initializeShareCommentary
  );
  const [files, setFiles] = useState<FileWithPreview[]>(initializeFiles);

  const handleShareCommentaryChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setShareCommentary(e.target.value.slice(0, 3000));
    onContentChange({
      shareCommentary: e.target.value.slice(0, 3000),
      shareMediaCategory:
        files.length > 0 ? shareMediaCategory.IMAGE : shareMediaCategory.NONE,
      media: files,
    });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (
      files.length > 0 &&
      (files[0].type.includes("video") ||
        acceptedFiles[0].type.includes("video"))
    ) {
      alert("To upload a video, you must upload it individually");
      return;
    }

    const updatedFiles: FileWithPreview[] = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    const newFiles = [...files, ...updatedFiles];
    setFiles(newFiles);
    onContentChange({
      shareCommentary: shareCommentary,
      shareMediaCategory:
        updatedFiles.length > 0
          ? shareMediaCategory.IMAGE
          : shareMediaCategory.NONE,
      media: newFiles,
    });
  };

  const handleDelete = (file: FileWithPreview) => {
    const filteredFiles = files.filter((f) => f !== file);
    URL.revokeObjectURL(file.preview);
    setFiles(filteredFiles);
    onContentChange({
      shareCommentary: shareCommentary,
      shareMediaCategory:
        filteredFiles.length > 0
          ? shareMediaCategory.IMAGE
          : shareMediaCategory.NONE,
      media: filteredFiles,
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  return (
    <>
      <div>
        <label>Post:</label>
        <textarea
          value={shareCommentary}
          onChange={handleShareCommentaryChange}
          className="w-full p-2 border rounded mb-4 min-h-52"
          maxLength={3000}
          placeholder="Write your post here"
          required
        />
        <div
          className={`text-right ${
            shareCommentary.length > 3000 ? "text-red-500" : "text-gray-600"
          }`}
        >
          {shareCommentary.length}/3000
        </div>
      </div>
      <div
        {...getRootProps()}
        className="border-dashed border-2 border-gray-400 rounded p-4 mb-8 text-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Arrastra y suelta los archivos aquí...</p>
        ) : (
          <p>Haz clic o arrastra y suelta los archivos aquí para subir</p>
        )}
      </div>
      <div className="flex flex-wrap">
        {files.map((file) => (
          <div key={file.name} className="inline-block mr-4 mb-4">
            {file.type.startsWith("image/") ? (
              <img
                src={file.preview}
                className="w-32 h-32 object-cover rounded"
                alt={file.name}
              />
            ) : (
              <video
                src={file.preview}
                className="w-32 h-32 object-cover rounded"
                controls
              />
            )}
            <button
              onClick={() => handleDelete(file)}
              className="block mt-2 text-sm text-red-500"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default SocialMediaTextareaLinkedin;
