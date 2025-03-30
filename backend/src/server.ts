 import express, { Request, Response, Router } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import Drawing from "./models/Drawing"; // Ensure correct path
import { text } from "stream/consumers";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI as string;

// 🔴 Check if MONGO_URI exists
if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env file");
  process.exit(1);
}

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Create HTTP Server
const server = createServer(app);

// ✅ Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Change this to your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// ✅ Handle WebSocket Connections
io.on("connection", (socket) => {
  console.log(`⚡ New user connected: ${socket.id}`);

  // Generate and send a session ID when a user connects
  const sessionId = socket.id;
  socket.emit("sessionId", sessionId);
  console.log(`⚡ Assigned session ID: ${sessionId}`);

  // Handle user joining a shared session
  socket.on("joinSession", (sessionId) => {
    console.log(`📢 User ${socket.id} joined session: ${sessionId}`);
    socket.join(sessionId);
  });

  // Handle drawing events (broadcast to other users in the session)
  socket.on("drawing", (data) => {
    socket.broadcast.to(data.sessionId).emit("drawing", data);
  });

  // Handle saving drawings via Socket.io
  socket.on("saveDrawing", async ({ sessionId, strokes, textObjects }) => {
    try {
      // console.log("Saving drawing:", sessionId, strokes);
      const trimmedSessionId = sessionId.trim();
      let drawing = await Drawing.findOne({ sessionId: trimmedSessionId });

      if (!drawing) {
        drawing = new Drawing({ sessionId: trimmedSessionId, strokes, textObjects });
      } else {
        drawing.textObjects.push(...textObjects);
        drawing.strokes.push(...strokes);
      }

      await drawing.save();
      io.to(trimmedSessionId).emit("strokesUpdated", drawing.strokes);
      socket.emit("drawingSaved", { message: "Drawing saved successfully!" });
    } catch (error) {
      socket.emit("error", { message: "Error saving drawing" });
    }
  });


  // Handle fetching drawings via Socket.io
socket.on("getDrawing", async ({ sessionId }) => {
  try {
    const trimmedSessionId = sessionId.trim();
    const drawing = await Drawing.findOne({ sessionId: trimmedSessionId });

    if (!drawing) {
      socket.emit("drawingNotFound", { message: "No drawing found for this session." });
    } else {
      socket.emit("drawingFetched", drawing.strokes, drawing.textObjects);
    }
  } catch (error) {
    socket.emit("error", { message: "Error retrieving drawing" });
  }
});


  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ✅ Express API Routes
const router = Router();

router.post("/:sessionId", async (req: Request, res: Response) => {
  try {
    const trimmedSessionId = req.params.sessionId.trim();
    const { strokes } = req.body;

    let drawing = await Drawing.findOne({ sessionId: trimmedSessionId });

    if (!drawing) {
      drawing = new Drawing({ sessionId: trimmedSessionId, strokes });
    } else {
      drawing.strokes.push(...strokes);
    }

    await drawing.save();
    io.to(trimmedSessionId).emit("strokesUpdated", drawing.strokes);

    res.json(drawing);
  } catch (error) {
    res.status(500).json({ error: "Error saving drawing" });
  }
});

router.get("/:sessionId", async (req: Request, res: Response) => {
  try {
    const trimmedSessionId = req.params.sessionId.trim();
    const drawing = await Drawing.findOne({ sessionId: trimmedSessionId });

    if (!drawing) {
      return res.status(404).json({ message: "No drawing found" });
    }

    return res.json(drawing);
  } catch (error) {
    return res.status(500).json({ error: "Error retrieving drawing" });
  }
});

// ✅ Register Routes
app.use("/api/drawings", router);

// ✅ Connect to MongoDB and Start Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
