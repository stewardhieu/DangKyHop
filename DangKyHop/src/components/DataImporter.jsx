import React, { useState } from 'react';

export default function DataImporter() {
  const [data, setData] = useState([]);

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('Text');
    
    // Tách dòng (\n) và tách ô (\t) từ cấu trúc Excel
    const rows = clipboardData.split('\n').filter(row => row.trim() !== '');
    const parsedData = rows.map(row => {
      const columns = row.split('\t');
      return columns.map(cell => String(cell.trim())); // Ép kiểu chuỗi, chặn lỗi E+11
    });

    setData(parsedData);
  };

  return (
    <div className="fade-in">
      <h3>Nhập dữ liệu định mức (Paste từ Excel)</h3>
      <textarea 
        style={{ width: '100%', height: '100px', marginBottom: '15px' }}
        placeholder="Click và dán (Ctrl+V/Cmd+V) dữ liệu cột/ô từ file Excel..."
        onPaste={handlePaste}
      />
      
      {data.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="auto-stretch-table">
            <tbody>
              {data.map((row, rIndex) => (
                <tr key={rIndex}>
                  {row.map((cell, cIndex) => <td key={cIndex}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}