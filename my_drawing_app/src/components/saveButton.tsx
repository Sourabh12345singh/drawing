import React from "react";
import { saveDrawing } from "../api/drawingapi";// Adjust path if needed

interface SaveButtonProps {
  sessionId: string;
  strokes: any[];
}

const SaveButton: React.FC<SaveButtonProps> = ({ sessionId, strokes }) => {
  const handleSave = async () => {
    try {
      await saveDrawing(sessionId, strokes);
      alert("Drawing saved successfully!");
    } catch (error) {
      alert("Failed to save drawing.");
    }
  };

  return (
    <button 
      onClick={handleSave} 
      className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-md shadow-md hover:bg-blue-600 transition"
    >
      Save
    </button>
  );
};

export default SaveButton;
