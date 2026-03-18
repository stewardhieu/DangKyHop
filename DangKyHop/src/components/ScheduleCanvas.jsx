import React, { useEffect, useRef, useState } from 'react';

export default function ScheduleCanvas() {
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([[]]); // Lưu trữ state qua từng bước
  const [step, setStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  // Tính năng Undo / Redo
  const handleUndo = () => step > 0 && setStep(step - 1);
  const handleRedo = () => step < history.length - 1 && setStep(step + 1);

  // Phím tắt Enter/Esc cho Hộp thoại
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showConfirm) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        setShowConfirm(false);
        // Logic xác nhận lưu tại đây
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfirm]);

  // Vẽ Canvas và xử lý chống đè chữ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawScheduleBlock = (x, y, width, text) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x, y, width, 40);
      ctx.fillStyle = '#0f172a';
      ctx.font = '14px sans-serif';

      // Thuật toán đo và cắt chữ để không bị tràn / đè lên nhau
      let displayText = text;
      const padding = 10;
      if (ctx.measureText(displayText).width > width - padding) {
        while (ctx.measureText(displayText + '...').width > width - padding && displayText.length > 0) {
          displayText = displayText.slice(0, -1);
        }
        displayText += '...';
      }
      ctx.fillText(displayText, x + 5, y + 25);
    };

    // Dữ liệu giả định để render
    drawScheduleBlock(20, 20, 120, "KTPN_2024_A_Rất_Dài");
    drawScheduleBlock(150, 20, 100, "KTPN_2024_B");

  }, [step, history]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleUndo} disabled={step === 0}>Undo</button>
        <button onClick={handleRedo} disabled={step === history.length - 1} style={{ marginLeft: '5px' }}>Redo</button>
        <button onClick={() => setShowConfirm(true)} style={{ marginLeft: '15px' }}>Lưu lịch trình</button>
      </div>
      
      <canvas ref={canvasRef} width={800} height={400} style={{ border: '1px solid #cbd5e1' }} />

      {showConfirm && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h4>Xác nhận lưu thay đổi?</h4>
            <p>Nhấn [Enter] để đồng ý, [Esc] để hủy.</p>
          </div>
        </div>
      )}
    </div>
  );
}