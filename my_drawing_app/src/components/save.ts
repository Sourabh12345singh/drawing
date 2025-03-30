import { Socket } from "socket.io-client";
import toast from "react-hot-toast";
// import { text } from "stream/consumers";

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

interface DrawingProps {
  strokes: any[]; // Replace 'any' with the actual stroke type if available
  socket: Socket; // Pass the socket instance as a prop
  sessionId: string; // Session ID to save/fetch drawings
  textObjects?: TextObject[];
}

interface fetchDrawingProps{ 
  strokes: Stroke[];
  textObjects: TextObject[];
}

// ✅ Save Drawing via Socket.io
export const saveDrawing = ({ strokes, socket, sessionId, textObjects }: DrawingProps) => {
  if ((!strokes || strokes.length === 0) && (!textObjects || textObjects.length === 0)) {
    toast.error("No drawing to save!");
    return;
  }

  // Emit the drawing data via Socket.io
  socket.emit("saveDrawing", { sessionId, strokes, textObjects });

  toast.success("Drawing sent to the server!", {
    position: "top-center",
    duration: 2000,
  });
};

export const fetchDrawing = async ({ socket, sessionId }: Pick<DrawingProps, "socket" | "sessionId">): Promise<fetchDrawingProps> => {
  if (!sessionId) {
    toast.error("Invalid session ID!");
    return Promise.resolve({ strokes: [], textObjects: [] }); // Return empty arrays if session ID is invalid
  }

  return new Promise((resolve, reject) => {
    // console.log("Fetching drawing..."); // Debug if it's called multiple times

    // ✅ Remove previous listeners
    socket.off("drawingFetched");
    socket.off("drawingNotFound");
    socket.off("error");

    // Emit request to get drawing
    socket.emit("getDrawing", { sessionId });

    // ✅ Handle received drawing (ensure it's only called once)
    socket.once("drawingFetched", (strokes: Stroke[], textObjects: TextObject[]) => {
      // console.log("Drawing received:", strokes);
      toast.success("Drawing loaded!");
      console.log("Drawing loaded:", strokes, textObjects);
      resolve({strokes, textObjects});
    });

    // ✅ Handle case when no drawing is found
    socket.once("drawingNotFound", ({ message }) => {
      console.warn(message);
      toast.error(message);
      resolve({ strokes: [], textObjects: [] }); 
    });

    // ✅ Handle errors
    socket.once("error", ({ message }) => {
      console.error("Error:", message);
      toast.error("Error fetching drawing.");
      reject(new Error(message));
    });
  });
};
