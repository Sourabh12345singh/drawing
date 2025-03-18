import express, { Request, Response, Router } from "express";
import Drawing from "../models/Drawing"; // Ensure the correct path

const router = Router();

// Save a drawing stroke
router.post("/:sessionId", async (req: Request, res: Response) => {
  try {
    const trimmedSessionId = req.params.sessionId.trim(); // ✅ Trim before using
    const { strokes } = req.body;

    let drawing = await Drawing.findOne({ sessionId: trimmedSessionId });

    if (!drawing) {
      drawing = new Drawing({ sessionId: trimmedSessionId, strokes });
    } else {
      drawing.strokes.push(...strokes);
    }

    await drawing.save();
    res.json(drawing);
  } catch (error) {
    res.status(500).json({ error: "Error saving drawing" });
  }
});

// Retrieve a drawing session
router.get("/:sessionId", async (req: Request, res: Response) => {
  try {
    const trimmedSessionId = req.params.sessionId.trim(); // ✅ Trim spaces and newlines
    // console.log("Processed sessionId:", trimmedSessionId);

    const drawing = await Drawing.findOne({ sessionId: trimmedSessionId });
    // console.log("Found drawing:", drawing);

    if (!drawing) {
      return res.status(404).json({ message: "No drawing found" });
    }

    return res.json(drawing);
  } catch (error) {
    return res.status(500).json({ error: "Error retrieving drawing" });
  }
});

export default router;
