"use client";

import React, { useState } from "react";
import FileSystemDisplay from "./FileSystemDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";

const SideBar = () => {
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [showFileForm, setShowFileForm] = useState(false);
  const [folder, setFolder] = useState("");
  const [file, setFile] = useState("");

  const handleAddFolder = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/folders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folder }),
      });

      if (!res.ok) throw new Error("Failed to create folder");

      console.log("Folder added:", folder);
    } catch (err) {
      console.error(err);
    }
    setFolder("");
    setShowFolderForm(false);
  };

  const handleAddFile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/folders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file }),
      });

      if (!res.ok) throw new Error("Failed to create file");

      console.log("File added:", file);
    } catch (err) {
      console.log(err);
    }
    setFile("");
    setShowFileForm(false);
  };

  const handleDisplayGraph = (e) => {
    e.preventDefault();
    console.log("Display Graph");
  };

  return (
    <div>
      <div>
        <div className="ml-40 mt-4">
          <Button onClick={() => setShowFolderForm(true)} className="mr-4">
            📁
          </Button>
          <Button onClick={() => setShowFileForm(true)}>📄</Button>
        </div>
        <div className="ml-20 mt-4">
          {showFolderForm && (
            <form onSubmit={handleAddFolder}>
              <Input
                placeholder="Enter folder name"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-48 text-white"
              ></Input>
            </form>
          )}
          {showFileForm && (
            <form onSubmit={handleAddFile}>
              <Input
                placeholder="Enter file name"
                value={file}
                onChange={(e) => setFile(e.target.value)}
                className="w-48 text-white"
              ></Input>
            </form>
          )}
        </div>
      </div>
      <FileSystemDisplay />
      <Button
        onClick={handleDisplayGraph}
        className="absolute bottom-8 left-16"
      >
        🪐
      </Button>
    </div>
  );
};

export default SideBar;
