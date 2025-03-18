import axios from "axios";

const API_URL = "http://localhost:5001/api/drawings"; 

export const saveDrawing = async (sessionId: string, strokes: any[]) => {
  try {
    const response = await axios.post(`${API_URL}/${sessionId}`, { strokes });
    return response.data;
  } catch (error) {
    console.error("Error saving drawing:", error);
    throw error;
  }
};

export const getDrawing = async (sessionId: string) => {
  try {
    const response = await axios.get(`${API_URL}/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching drawing:", error);
    return null;
  }
};
