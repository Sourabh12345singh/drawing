import React from "react";

interface ToolbarProps {
  setLineWidth: (width: number) => void;
  isEraser: boolean;
  setIsEraser: (value: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ setLineWidth, isEraser, setIsEraser }) => {
  return (
    <div className="absolute top-4 left-4 flex gap-4 bg-white p-2 rounded shadow">
      {/* Pencil Thickness Slider */}
      <label className="flex flex-col">
        <span className="text-sm">Thickness</span>
        <input
          type="range"
          min="1"
          max="10"
          defaultValue="3"
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="cursor-pointer"
        />
      </label>

      {/* Eraser Button */}
      <button
        onClick={() => setIsEraser(!isEraser)}
        className={`px-3 py-2 rounded ${isEraser ? "bg-gray-500 text-white" : "bg-white text-black border"}`}
      >
        {isEraser ? "Eraser ON" : "Eraser OFF"}
      </button>
    </div>
  );
};

export default Toolbar;
