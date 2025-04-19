import React, { useEffect, useState } from "react";

const buildTree = (items) => {
  const lookup = {};
  const root = [];

  items.forEach((item) => {
    lookup[item.id] = { ...item, children: [] };
  });

  items.forEach((item) => {
    if (item.parent_id === null || item.parent_id === "None") {
      root.push(lookup[item.id]);
    } else if (lookup[item.parent_id]) {
      lookup[item.parent_id].children.push(lookup[item.id]);
    }
  });

  return root;
};

const FileTree = ({ nodes, onClick }) => {
  return (
    <ul className="pl-4">
      {nodes.map((node) => (
        <li key={node.id} onClick={() => props.onClick(file)}>
          {node.type === "folder" ? "📁" : "📝"} {node.name}
          {node.children?.length > 0 && (
            <FileTree nodes={node.children} onClick={onClick} />
          )}
        </li>
      ))}
    </ul>
  );
};

const FileSystemDisplay = ({ onClick }) => {
  const [fileSystem, setFileSystem] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileSystem = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/");
        if (!res.ok) throw new Error("Failed to fetch file system");
        const data = await res.json();
        const tree = buildTree(data);
        setFileSystem(tree);
      } catch (err) {
        console.error("Error fetching file system:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFileSystem();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!fileSystem.length) return <p className="ml-8">No files or folders...</p>;

  return (
    <div>
      <h2 className="font-semibold text-lg mb-2">File System</h2>
      <FileTree nodes={fileSystem} onClick={onClick} />
    </div>
  );
};

export default FileSystemDisplay;
