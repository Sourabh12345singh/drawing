// TextCanvas.tsx
import React, { useRef, useState, useEffect } from 'react';

interface TextObject {
  id: number;
  text: string;
  x: number;
  y: number;
}

const TextCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textObjects, setTextObjects] = useState<TextObject[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<TextObject | null>(null);
  const [inputText, setInputText] = useState<string>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) redrawCanvas(ctx);
  }, [textObjects]);

  const redrawCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    textObjects.forEach(textObj => {
      ctx.font = '16px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(textObj.text, textObj.x, textObj.y);
    });
  };

  const handleAddText = () => {
    if (!inputText) return;
    
    const newText: TextObject = {
      id: Date.now(),
      text: inputText,
      x: 50,
      y: 50,
    };
    
    setTextObjects([...textObjects, newText]);
    setInputText('');
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clickedText = textObjects.find(text => {
      ctx.font = '16px Arial';
      const width = ctx.measureText(text.text).width;
      return x >= text.x && 
             x <= text.x + width && 
             y >= text.y - 16 && 
             y <= text.y;
    });

    if (clickedText) {
      setSelectedText(clickedText);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedText || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTextObjects(textObjects.map(text => 
      text.id === selectedText.id ? { ...text, x, y } : text
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedText(null);
  };

  const handleTextEdit = (id: number, newText: string) => {
    setTextObjects(textObjects.map(text => 
      text.id === id ? { ...text, text: newText } : text
    ));
  };

  return (
    <div>
      <div>
        <input 
          type="text" 
          value={inputText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
          placeholder="Enter text"
        />
        <button onClick={handleAddText}>Add Text</button>
      </div>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {selectedText && (
        <input
          type="text"
          value={selectedText.text}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleTextEdit(selectedText.id, e.target.value)}
          style={{
            position: 'absolute',
            left: `${selectedText.x}px`,
            top: `${selectedText.y + 20}px`,
          }}
        />
      )}
    </div>
  );
};

export default TextCanvas;