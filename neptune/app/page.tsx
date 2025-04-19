"use client";

import React, { useState } from "react";
import FileSystemDisplay from "../components/FileSystemDisplay";
import NotesDisplay from "../components/NotesDisplay";
import GraphDisplay from "../components/GraphDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "../components/ui/input";

const Home = () => {
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [showFileForm, setShowFileForm] = useState(false);
  const [folder, setFolder] = useState("");
  const [file, setFile] = useState("");
  const [showGraph, setShowGraph] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [parent, setParent] = useState("");
  const [selectedFile, setSelectedFile] = useState("");

  const handleAddFolder = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folder, type: "folder", parent: parent }),
      });

      if (!res.ok) throw new Error("Failed to create folder");

      console.log("Folder added:", folder);
    } catch (err) {
      console.error(err);
    }
    setFolder("");
    setShowFolderForm(false);
    setParent("");
  };

  const handleAddFile = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setShowGraph(false);
    try {
      const res = await fetch("http://localhost:8000/api/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file, type: "file", parent: parent }),
      });

      if (!res.ok) throw new Error("Failed to create file");

      console.log("File added:", file);
    } catch (err) {
      console.log(err);
    }
    setFile("");
    setShowFileForm(false);
    setParent("");
  };

  const handleFileClick = async (file: {
    id: string;
    parent_id: string;
    content?: string;
    type: string;
    name: string;
  }) => {
    if (file.type === "folder") {
      setParent(file.id);
    } else {
      setSelectedFile(file.id);
    }
  };

  const handleDisplayGraph = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setShowGraph(!showGraph);
    setShowNotes(!showNotes);
    setParent("");
  };

  return (
    <div className="flex">
      <div>
        <div>
          <div className="ml-40 mt-8 flex">
            <Button
              onClick={() => setShowFolderForm(true)}
              className="mr-4 text-xl"
            >
              📁
            </Button>
            <Button onClick={() => setShowFileForm(true)} className="text-xl">
              📄
            </Button>
          </div>
          <div className="ml-8 my-4">
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
        <FileSystemDisplay onClick={handleFileClick} />
        <Button
          onClick={handleDisplayGraph}
          className="absolute bottom-8 left-16 text-xl"
        >
          🪐
        </Button>
      </div>
      <div>{showNotes && <NotesDisplay selectedFile={selectedFile} />}</div>
      <div className="bg-white w-[600px] h-[600px] ml-8">
        {showGraph && <GraphDisplay />}
      </div>
    </div>
  );
};

export default Home;
