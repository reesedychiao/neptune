import React, { useEffect, useState } from "react";

const FileSystemDisplay = () => {
  const [fileSystem, setFileSystem] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileSystem = async () => {
      try {
        const res = await fetch("/api/filesystem/");
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

  if (loading) return <p className="ml-8">Loading...</p>;
  if (!fileSystem.length) return <p className="ml-4">No files or folders...</p>;

  return (
    <div>
      <h2>File System</h2>
      <ul className="list-disc pl-5">
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
