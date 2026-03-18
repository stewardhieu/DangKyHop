import React from 'react';

export default function AdvancedFilter() {
  return (
    <div className="fade-in" style={{ padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <h4>Advance Filter</h4>
      <div style={{ display: 'flex', gap: '10px' }}>
        <select>
          <option value="">-- Trạng thái phòng --</option>
          <option value="empty">Phòng trống</option>
          <option value="booked">Đã xếp lịch</option>
        </select>
        <select>
          <option value="">-- Sức chứa --</option>
          <option value="150">150 chỗ</option>
          <option value="custom">Khác</option>
        </select>
        <input type="text" placeholder="Tìm mã lớp..." />
        <button>Lọc dữ liệu</button>
      </div>
    </div>
  );
}