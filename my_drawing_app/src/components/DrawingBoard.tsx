import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import toast from "react-hot-toast";
import ArtNavbar from "./art-navbar";
import { useParams } from "react-router-dom";

interface Stroke {
  x: number;
  y: number;
  dragging: boolean;
  lineWidth: number;
  color: string;
}

interface TextObject {
  id: number;
  text: string;
  x: number;
  y: number;
}

const DrawingBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [textObjects, setTextObjects] = useState<TextObject[]>([]);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [selectedText, setSelectedText] = useState<TextObject | null>(null);
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [bgColor, setBgColor] = useState("#f0f0f0");
  const { sessionId } = useParams();
  const currentSessionId = sessionId || "";

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
      redrawCanvas();
    }
  }, [bgColor, strokes, textObjects]);

  const redrawCanvas = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw strokes
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

    // Draw text
    textObjects.forEach(textObj => {
      ctx.font = '16px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(textObj.text, textObj.x, textObj.y);
    });
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!ctxRef.current || isDraggingText) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    const color = isEraser ? bgColor : "black";
    const width = isEraser ? lineWidth * 2 : lineWidth;

    ctxRef.current.lineWidth = width;
    ctxRef.current.strokeStyle = color;

    const newStroke: Stroke = { x: offsetX, y: offsetY, dragging: false, lineWidth: width, color };
    setUndoStack((prev) => [...prev, strokes]);
    setStrokes((prev) => [...prev, newStroke]);
    socket.emit("drawing", newStroke);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !ctxRef.current || isDraggingText) return;

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
    setIsDraggingText(false);
    setSelectedText(null);
  };

  const handleTextMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current || isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = ctxRef.current;
    if (!ctx) return;

    const clickedText = textObjects.find(text => {
      ctx.font = '16px Arial';
      const width = ctx.measureText(text.text).width;
      return x >= text.x && 
             x <= text.x + width && 
             y >= text.y - 16 && 
             y <= text.y;
    });

    if (clickedText) {
      setSelectedText(clickedText);
      setIsDraggingText(true);
    }
  };

  const handleTextMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingText || !selectedText || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTextObjects(textObjects.map(text => 
      text.id === selectedText.id ? { ...text, x, y } : text
    ));
  };

  useEffect(() => {
    socket.on("drawing", (data: Stroke) => {
      setStrokes((prev) => [...prev, data]);
    });

    return () => {
      socket.off("drawing");
    };
  }, []);

  const handleUndo = () => {
    if (undoStack.length === 0) {
      toast.error("Nothing to undo!");
      return;
    }
    const previousState = undoStack.pop()!;
    setRedoStack((prev) => [...prev, strokes]);
    setStrokes(previousState);
    toast.success("Last stroke undone!");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) {
      toast.error("No more strokes to redo!");
      return;
    }
    const nextState = redoStack.pop()!;
    setUndoStack((prev) => [...prev, strokes]);
    setStrokes(nextState);
    toast.success("Redo performed!");
  };

  const handleClear = () => {
    setStrokes([]);
    setTextObjects([]);
    setUndoStack([]);
    setRedoStack([]);
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      toast.success("Canvas cleared!");
    }
  };

  const addText = (text: string) => {
    const newText: TextObject = {
      id: Date.now(),
      text,
      x: 50, // Default position
      y: 50,
    };
    setTextObjects([...textObjects, newText]);
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <ArtNavbar
        handleClear={handleClear}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
        canvasRef={canvasRef}
        bgcolor={bgColor}
        strokes={strokes}
        setStrokes={setStrokes}
        sessionId={currentSessionId}
        addText={addText}
        textObjects={textObjects}
      />
      
      <div className="fixed bottom-5 left-4 flex flex-col gap-3 p-4 bg-gray-500/30 text-black/70 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
        <label className="flex items-center gap-3 font-semibold">
          <span>{isEraser ? "Eraser Size:" : "Brush Size:"}</span>
          <input
            type="range"
            min="2"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="cursor-pointer accent-purple-500"
          />
        </label>
        <label className="flex items-center gap-3 font-semibold">
          <span>Background:</span>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-10 h-6 border border-white/30 rounded-lg shadow-md bg-transparent"
          />
        </label>
      </div>  
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => {
          startDrawing(e);
          handleTextMouseDown(e);
        }}
        onMouseMove={(e) => {
          draw(e);
          handleTextMouseMove(e);
        }}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="border border-gray-400 shadow-xl rounded-xl transition-all duration-300 hover:shadow-2xl"
        style={{ backgroundColor: bgColor }}
      />
    </div>
  );
};

export default DrawingBoard;