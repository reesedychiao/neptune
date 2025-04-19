import React, { useEffect, useState } from "react";

const FileSystemDisplay = ({ onClick }) => {
  const [fileSystem, setFileSystem] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileSystem = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/filesystem/");
        if (!res.ok) throw new Error("Failed to fetch file system");
        const data = await res.json();
        setFileSystem(data);
      } catch (err) {
        console.log("Error fetching file system:", err);
      } finally {
        setLoading(false);
      }
      fetchFileSystem();
    };
  }, []);

  if (!fileSystem.length) return <p className="ml-8">No files or folders...</p>;

  return (
    <div>
      <h2>File System</h2>
      <ul className="list-disc pl-5" onClick={onClick}>
        {fileSystem.map((item, index) => (
          <li key={index}>
            {item.type === "folder" ? "📁" : "📄"}
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileSystemDisplay;
