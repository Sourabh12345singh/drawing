import type React from "react";
// import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { XCircle, Save, RefreshCcw, Users, Type } from "lucide-react";
import {
  Undo2,
  Redo2,
  Paintbrush,
  Eraser,
  Palette,
  Download,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { handleDownloadPDF } from "./DownloadButton";
import { inviteLink } from "./saveButton";
import { fetchDrawing, saveDrawing } from "./save";
import { socket } from "../socket";

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

interface NavbarProps {
  handleClear: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  isEraser: boolean;
  setIsEraser: React.Dispatch<React.SetStateAction<boolean>>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  bgcolor: string;
  strokes: Stroke[];
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
  sessionId: string;
  addText: (text: string) => void;
  textObjects: TextObject[];
}

const ArtNavbar: React.FC<NavbarProps> = ({
  handleClear,
  handleUndo,
  handleRedo,
  isEraser,
  setIsEraser,
  canvasRef,
  bgcolor,
  sessionId,
  strokes,
  setStrokes,
  addText,
  textObjects,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const downloadCanvas = (format: "png" | "jpeg") => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataURL =
      format === "png"
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", 0.8);
    const link = document.createElement("a");
    link.download = `artwork.${format}`;
    link.href = dataURL;
    link.click();
  };

  const handleAddText = () => {
    if (!inputText) return;
    addText(inputText);
    setInputText("");
  };

  return (
    <TooltipProvider delayDuration={300}>
      <nav
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out",
          // scrolled ? "bg-background/80 backdrop-blur-md shadow-md py-2" : "bg-gradient-to-r from-purple-300/90 via-indigo-300/90 to-blue-300/90 py-4",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                ArtCanvas
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex bg-background/20 backdrop-blur-sm rounded-full p-1 shadow-inner">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleUndo}
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-9 w-9 hover:bg-primary/20"
                    >
                      <Undo2 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleRedo}
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-9 w-9 hover:bg-primary/20"
                    >
                      <Redo2 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo</TooltipContent>
                </Tooltip>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsEraser(!isEraser)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 shadow-md rounded-full bg-white text-black"
                  >
                    {isEraser ? (
                      <>
                        <Eraser className="h-4 w-4 text-black" />
                        <span className="hidden sm:inline font-semibold">Eraser</span>
                      </>
                    ) : (
                      <>
                        <Paintbrush className="h-4 w-4 text-black" />
                        <span className="hidden sm:inline font-semibold">Brush</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
                  Toggle Brush/Eraser
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 shadow-md transition-all hover:bg-gray-100"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="hidden sm:inline text-gray-700 font-semibold">Clear</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
                  Clear Canvas
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text"
                  className="px-2 py-1 border rounded"
                />
                <Button
                  onClick={handleAddText}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 shadow-md rounded-md"
                >
                  <Type className="h-4 w-4 text-black" />
                  <span className="hidden sm:inline text-black font-semibold">Add Text</span>
                </Button>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => saveDrawing({ strokes, socket, sessionId, textObjects })}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 shadow-md transition-all hover:bg-gray-100"
                  >
                    <Save className="h-4 w-4 text-green-500" />
                    <span className="hidden sm:inline text-gray-700 font-semibold">Save</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
                  Save drawing
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={async () => {
                      const received = await fetchDrawing({ socket, sessionId });
                      console.log("Drawing received:", received.strokes, received.textObjects);
                      if (received.textObjects.length > 0) {
                        addText(received.textObjects[0].text);
                      }
                      if (received.strokes.length > 0) {
                        setStrokes([...strokes, ...received.strokes]);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 shadow-md rounded-md"
                  >
                    <RefreshCcw className="h-4 w-4 text-black" />
                    <span className="hidden sm:inline text-black font-semibold">Update</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
                  Refresh drawing from server
                </TooltipContent>
              </Tooltip>

              <Button
                onClick={() => inviteLink()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 shadow-md rounded-md"
              >
                <Users className="h-4 w-4 text-black" />
                <span className="hidden sm:inline text-black font-semibold">Collab</span>
              </Button>

              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 shadow-md rounded-md"
                      >
                        <Download className="h-4 w-4 text-black" />
                        <span className="hidden sm:inline text-black font-semibold">Export</span>
                        <ChevronDown className="h-3 w-3 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
                    Download Artwork
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => downloadCanvas("png")}>
                    PNG Format
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadPDF(canvasRef, bgcolor)}>
                    PDF Format
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default ArtNavbar;