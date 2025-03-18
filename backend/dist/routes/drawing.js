"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Drawing_1 = __importDefault(require("../models/Drawing")); // ✅ Ensure correct import path
const router = express_1.default.Router(); // ✅ Use express.Router() instead of Router()
// ✅ Save a drawing stroke
router.post("/:sessionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionId } = req.params;
        const { strokes } = req.body;
        let drawing = yield Drawing_1.default.findOne({ sessionId });
        if (!drawing) {
            drawing = new Drawing_1.default({ sessionId, strokes });
        }
        else {
            drawing.strokes.push(...strokes);
        }
        yield drawing.save();
        res.json(drawing);
    }
    catch (error) {
        res.status(500).json({ error: "Error saving drawing" });
    }
}));
// ✅ Retrieve a drawing session
router.get("/:sessionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionId = req.params.sessionId; // ✅ Extract explicitly
        const drawing = yield Drawing_1.default.findOne({ sessionId });
        if (!drawing) {
            return res.status(404).json({ message: "No drawing found" });
        }
        return res.json(drawing);
    }
    catch (error) {
        return res.status(500).json({ error: "Error retrieving drawing" });
    }
}));
exports.default = router;
