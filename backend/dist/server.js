"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const drawing_1 = __importDefault(require("./routes/drawing"));
dotenv_1.default.config(); // ✅ Load environment variables
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI; // ✅ Ensure it's a string
// 🔴 Check if MONGO_URI exists
if (!MONGO_URI) {
    console.error("❌ Missing MONGO_URI in .env file");
    process.exit(1);
}
// ✅ Middleware
app.use((0, cors_1.default)()); // 🔹 Enables Cross-Origin Resource Sharing (useful for frontend)
app.use(express_1.default.json()); // 🔹 Parses incoming JSON requests
// ✅ Connect to MongoDB
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));
// ✅ API Routes
app.use("/api/drawings", drawing_1.default); // Mount drawing API
// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
