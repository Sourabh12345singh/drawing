import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import drawingRoutes from "./routes/drawing";
import {
  handleUserJoin,
  handleUserRemove,
  handleUserDisconnect,
} from "./collaboration";

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

// 🟢 Store connected users
let users: { [socketId: string]: { username: string; } } = {};

// ✅ Handle WebSocket Connections
io.on("connection", (socket) => {
  console.log(`⚡ New user connected: ${socket.id}`);

  // Generate a session ID when a user connects
const sessionId = socket.id;
socket.emit("sessionId", sessionId); // Send session ID to the client
console.log(`⚡ Assigned session ID: ${sessionId}`);


   // Handle user joining a shared session
   socket.on("joinSession", (sessionId) => {
    console.log(`📢 User ${socket.id} joined session: ${sessionId}`);
    socket.join(sessionId);
  });

  // Handle drawing events
  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data);
  });

  // // 🟢 Admin removes a user
  // socket.on("removeUser", (username) => {
  //   const userSocketId = Object.keys(users).find((id) => users[id].username === username);
  //   if (userSocketId) {
  //     io.to(userSocketId).emit("removed"); // Notify user
  //     delete users[userSocketId];
  //     io.emit("updateUsers", Object.values(users));
  //   }
  // });

  // Handle user disconnect
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("updateUsers", Object.values(users));
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ✅ Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ API Routes
app.use("/api/drawings", drawingRoutes);

// ✅ Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
