"use client";

import React from "react";

const NotesDisplay = ({ selectedFile }) => {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("Saved");
  const saveTimeoutRef = (useRef < NodeJS.Timeout) | (null > null);

  useEffect(() => {
    if (!selectedFile) {
      setNote("");
      setStatus("No File Selected");
      return;
    }
    const fetchNote = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/notes/");
        if (!res.ok) throw new Error("Failed to fetch note");
        const data = await res.json();
        setNote(data.note);
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
        const res = await fetch("http://localhost:8000/api/notes/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: newNote }),
        });

        if (!res.ok) throw new Error("Failed to save note");

        setStatus("Saved");
      } catch (err) {
        console.log("Error saving note:", err);
        setStatus("Error");
      }
    }, 1000);
  };

  return (
    <div className="ml-4 mr-40 mt-4 flex flex-col">
      <label htmlFor="markdown-note" className="mb-2 font-semibold">
        Notes ({selectedFile || "No file selected"})
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
        className={`w-full h-96 p-4 border rounded-lg shadow-sm resize-none ${
          selectedFile
            ? "border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
            : "bg-gray-100 border-gray-200 cursor-not-allowed"
        }`}
      />
      <span className="text-sm mt-2 text-gray-500">{status}</span>
    </div>
  );
};

export default NotesDisplay;
