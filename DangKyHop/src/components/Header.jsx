import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

export default function Header({
  classes,
  rooms,
  historyIndex,
  historyLength,
  handleUndo,
  handleRedo
}) {
  return (
    <header className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 mb-4 flex justify-between items-center relative z-10 transition-shadow hover:shadow-md">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Bảng Điều Khiển Quản Trị Lịch Họp (Ver 3.5 - Kéo Thả & Sắp Xếp)</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tổng số lớp: <span className="font-semibold text-blue-600">{classes.length}</span> | 
          Cơ sở vật chất: <span className="font-semibold text-amber-600">{rooms.length} phòng</span> |
          Đã xếp lịch: <span className="font-semibold text-green-600">{classes.filter(c=>c.isAssigned).length}/{classes.length} lớp</span>
        </p>
      </div>
      <div className="flex gap-2">
        <button onClick={handleUndo} disabled={historyIndex === 0} className="p-2 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors" title="Hoàn tác (Undo)">
          <Undo2 size={18} />
        </button>
        <button onClick={handleRedo} disabled={historyIndex === historyLength - 1} className="p-2 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors" title="Làm lại (Redo)">
          <Redo2 size={18} />
        </button>
      </div>
    </header>
  );
}
