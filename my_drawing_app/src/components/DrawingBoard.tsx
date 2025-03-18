import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import DownloadButtons from "./DownloadButton";
import toast from "react-hot-toast";

interface Stroke {
  x: number;
  y: number;
  dragging: boolean;
  lineWidth: number;
  color: string;
}

const DrawingBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [bgColor, setBgColor] = useState("#f0f0f0"); // Default background color
  // const[isShapeMode, setIsShapeMode] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [bgColor]);

  const startDrawing = (e: React.MouseEvent) => {
    if (!ctxRef.current) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    const color = isEraser ? bgColor : "black"; // Eraser uses bg color
    const width = isEraser ? lineWidth * 2 : lineWidth; // Eraser is slightly larger

    ctxRef.current.lineWidth = width;
    ctxRef.current.strokeStyle = color;

    const newStroke: Stroke = { x: offsetX, y: offsetY, dragging: false, lineWidth: width, color };
    setUndoStack((prev) => [...prev, strokes]);
    setStrokes((prev) => [...prev, newStroke]);

    socket.emit("drawing", newStroke);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !ctxRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const color = isEraser ? bgColor : "black";
    const width = isEraser ? lineWidth * 2 : lineWidth;

    ctxRef.current.lineWidth = width;
    ctxRef.current.strokeStyle = color;

    const newStroke: Stroke = { x: offsetX, y: offsetY, dragging: true, lineWidth: width, color };
    setStrokes((prev) => [...prev, newStroke]);

    socket.emit("drawing", newStroke);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  useEffect(() => {
    socket.on("drawing", (data: Stroke) => {
      setStrokes((prev) => [...prev, data]);
    });

    return () => {
      socket.off("drawing");
    };
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    strokes.forEach((stroke, index) => {
      ctx.beginPath();
      ctx.lineWidth = stroke.lineWidth;
      ctx.strokeStyle = stroke.color;
      if (stroke.dragging && index > 0) {
        ctx.moveTo(strokes[index - 1].x, strokes[index - 1].y);
      } else {
        ctx.moveTo(stroke.x - 1, stroke.y);
      }
      ctx.lineTo(stroke.x, stroke.y);
      ctx.stroke();
    });
  }, [strokes, bgColor]);

  const handleUndo = () => {
    if (undoStack.length === 0) {
      toast.error("Nothing to undo!");
      return;}
    const previousState = undoStack.pop()!;
//yaha mere stack pore system k liye ek hi banana chahiye
    setRedoStack((prev) => [...prev, strokes]);
    setStrokes(previousState);
    toast.success("Last stroke undone!");
  };

  const handleRedo = () => {
    if (redoStack.length === 0)
    {toast.error("No more strokes to redo!");
      return;}
    const nextState = redoStack.pop()!;
    setUndoStack((prev) => [...prev, strokes]);
    setStrokes(nextState);
    toast.success("Redo performed!");
  };

  
  const handleClear = () => {
    setStrokes([]);
    const ctx = ctxRef.current;
    setUndoStack([]);
    setRedoStack([]);
    if (ctx) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      toast.success("Canvas cleared!");
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      {/* Controls Panel */}
      <div className="absolute top-4 right-4 flex gap-3 p-4 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
        <button
          onClick={handleClear}
          className="px-5 py-2 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all duration-300 transform hover:scale-110 hover:shadow-xl"
        >
          🧹 Clear
        </button>
        <button
          onClick={handleUndo}
          className="px-5 py-2 text-white font-semibold bg-gray-600 hover:bg-gray-700 rounded-lg shadow-md transition-all duration-300 transform hover:scale-110 hover:shadow-xl"
        >
          ↩️ Undo
        </button>
        <button
          onClick={handleRedo}
          className="px-5 py-2 text-white font-semibold bg-gray-600 hover:bg-gray-700 rounded-lg shadow-md transition-all duration-300 transform hover:scale-110 hover:shadow-xl"
        >
          ↪️ Redo
        </button>
        <button
          onClick={() => setIsEraser((prev) => !prev)}
          className={`px-5 py-2 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-110 hover:shadow-xl ${
            isEraser ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          {isEraser ? "✂️ Eraser ON" : "✏️ Eraser OFF"}
        </button>
      </div>
  
      {/* Brush & Background Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-3 p-4 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
        <label className="flex items-center gap-3 text-white font-semibold">
          <span> {isEraser ? "Eraser Size:" : "Brush Size:"}</span>
          <input
            type="range"
            min="2"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="cursor-pointer accent-purple-500"
          />
        </label>
  
        <label className="flex items-center gap-3 text-white font-semibold">
          <span> Background:</span>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-10 h-6 border border-white/30 rounded-lg shadow-md bg-transparent"
          />
        </label>
      </div>
  
  
  
  
      {/* Download Button */}
      <DownloadButtons canvasRef={canvasRef} />
  
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="border border-gray-400 shadow-xl rounded-xl transition-all duration-300 hover:shadow-2xl"
        style={{ backgroundColor: bgColor }}
      />
    </div>
  );
};
  
export default DrawingBoard;
