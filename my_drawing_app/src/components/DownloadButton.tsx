import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface DownloadButtonsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>; // Accepts possible null values
}

const DownloadButtons: React.FC<DownloadButtonsProps> = ({ canvasRef }) => {
  const handleDownloadPNG = async () => {
    if (!canvasRef.current) return; // Ensure canvas is not null

    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = "drawing.png";
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!canvasRef.current) return; // Ensure canvas is not null
  
    const canvas = canvasRef.current;
    const image = await html2canvas(canvas);
    const imgData = image.toDataURL("image/png");
  
    const pdf = new jsPDF("landscape");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (image.height * pdfWidth) / image.width; // Maintain aspect ratio
  
    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 20); // Now with width & height
    pdf.save("drawing.pdf");
  };
  

  return (
    <div className="absolute top-2 left-2 flex gap-2">
      <button onClick={handleDownloadPNG} className="px-4 py-2 bg-green-500 text-white rounded">Download PNG</button>
      <button onClick={handleDownloadPDF} className="px-4 py-2 bg-red-500 text-white rounded">Download PDF</button>
    </div>
  );
};

export default DownloadButtons;
