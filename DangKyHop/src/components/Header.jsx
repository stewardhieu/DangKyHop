import React, { useState } from 'react';
import { Undo2, Redo2, LogIn, LogOut, Download, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { exportToImage, exportToPDF } from '../utils/exportUtils';

export default function Header({
  classes,
  rooms,
  historyIndex,
  historyLength,
  handleUndo,
  handleRedo,
  onOpenLogin,
  mainTab
}) {
  const { currentUser, logout } = useAuth();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format) => {
    setShowExportMenu(false);
    const targetId = mainTab === 'VISUAL' ? 'visual-grid-container' : 'table-container';
    const filename = `ThoiKhoaBieu_${mainTab}_${new Date().getTime()}`;
    
    // Slight delay to allow UI to close dropdown before capture
    setTimeout(() => {
      if (format === 'PNG') exportToImage(targetId, filename);
      else if (format === 'PDF') exportToPDF(targetId, filename);
    }, 100);
  };

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
      <div className="flex gap-4 items-center">
        {currentUser ? (
          <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
              Admin: {currentUser.email}
            </span>
            <button onClick={logout} className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1.5 border border-red-200 bg-white shadow-sm">
              <LogOut size={14} /> Thoát
            </button>
          </div>
        ) : (
          <div className="border-r border-slate-200 pr-4">
            <button onClick={onOpenLogin} className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded transition-colors flex items-center gap-1.5">
              <LogIn size={14} /> Đăng nhập
            </button>
          </div>
        )}

        <div className="relative">
          <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 shadow-sm rounded border border-slate-300 transition-colors">
            <Download size={14} /> Xuất TKB <span className="text-[10px] ml-1">{showExportMenu ? '▲' : '▼'}</span>
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <button onClick={() => handleExport('PNG')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 text-left transition-colors border-b border-slate-100">
                <ImageIcon size={16} /> Ra Ảnh (PNG)
              </button>
              <button onClick={() => handleExport('PDF')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 text-left transition-colors">
                <FileText size={16} /> Ra File (PDF)
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-l border-slate-200 pl-4">
          <button onClick={handleUndo} disabled={historyIndex === 0 || !currentUser} className="p-2 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors" title="Hoàn tác (Undo)">
            <Undo2 size={18} />
          </button>
          <button onClick={handleRedo} disabled={historyIndex === historyLength - 1 || !currentUser} className="p-2 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors" title="Làm lại (Redo)">
            <Redo2 size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
