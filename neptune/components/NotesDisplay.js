"use client";

import React, { useState, useEffect, useRef } from "react";

const NotesDisplay = ({ selectedFile }) => {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("Saved");
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!selectedFile.id) {
      setNote("");
      setStatus("No File Selected");
      return;
    }

    const fetchNote = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/${selectedFile}`);
        if (!res.ok) throw new Error("Failed to fetch note");
        const data = await res.json();
        setNote(data.content || "");
        setStatus("Loaded");
      } catch (err) {
        console.log("Error loading note:", err);
        setStatus("Error loading");
      }
    };

    fetchNote();
  }, [selectedFile]);

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    setStatus("Saving...");

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/${selectedFile}/content`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newNote }),
          }
        );

        if (!res.ok) throw new Error("Failed to save note");

        setStatus("Saved");
      } catch (err) {
        console.log("Error saving note:", err);
        setStatus("Error");
      }
    }, 1000);
  };

  return (
    <div className="ml-8 mr-40 mt-8 flex flex-col">
      <label htmlFor="markdown-note" className="mb-2 font-semibold">
        Notes ({note?.name || "No file selected"})
      </label>
      <textarea
        id="markdown-note"
        value={note}
        onChange={handleNoteChange}
        placeholder={
          selectedFile
            ? "Start typing your notes here..."
            : "Select a file to begin typing..."
        }
        disabled={!selectedFile}
        className={`w-5xl h-screen p-4 rounded-lg shadow-sm resize-none bg-black text-white ${
          selectedFile ? "" : "cursor-not-allowed"
        }`}
      />
      <span className="text-sm mt-2 text-gray-500">{status}</span>
    </div>
  );
};

export default NotesDisplay;
