// import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const handleDownloadPNG = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const image = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = image;
  link.download = "drawing.png";
  link.click();
};

export const handleDownloadPDF = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  bgColor: string = "#ffffff" // Use a supported color format (HEX or RGB)
) => {
  if (!canvasRef.current) return;
  
  const canvas = canvasRef.current;
  
  // Create a temporary canvas to merge the background and the drawing
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const ctx = tempCanvas.getContext("2d");
  if (!ctx) return;
  
  // Fill the temporary canvas with the desired background color
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
  // Draw the original canvas on top of the background
  ctx.drawImage(canvas, 0, 0);
  
  // Convert the temporary canvas to an image data URL
  const imgData = tempCanvas.toDataURL("image/png");
  
  // Create a new PDF document in landscape mode
  const pdf = new jsPDF("landscape");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (tempCanvas.height * pdfWidth) / tempCanvas.width; // Maintain aspect ratio
  
  // Add the image to the PDF (with a 10-unit margin)
  pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 20);
  pdf.save("drawing.pdf");
};


