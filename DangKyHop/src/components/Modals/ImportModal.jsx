import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export default function ImportModal({
  isImportModalOpen,
  setIsImportModalOpen,
  mainTab,
  pasteData,
  setPasteData,
  processImport
}) {
  if (!isImportModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[800px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-800">Cửa sổ Import Dữ Liệu Hàng Loạt</h3>
          <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-4 flex-1">
          <div className="mb-3 text-sm text-slate-700 bg-blue-50 border border-blue-100 p-3 rounded-md leading-relaxed">
            Yêu cầu hệ thống: Dữ liệu copy từ Excel phải tuân thủ chuẩn cấu trúc Tab-Separated. <br/>
            {mainTab === 'DATA_CLASS' && <span className="font-semibold text-blue-800">Cấu trúc 5 cột: Tên Lớp | Số lượng | Ngành | Giảng viên | Khoá học</span>}
            {mainTab === 'DATA_ROOM' && <span className="font-semibold text-blue-800">Cấu trúc 2 cột: Tên Phòng | Sức chứa tối đa (VD: P.201  150)</span>}
            {mainTab === 'DATA_INSTRUCTOR' && <span className="font-semibold text-blue-800">Cấu trúc 1 cột: Tên Giảng viên/QLLCN</span>}
          </div>
          <textarea 
            className="w-full h-64 border border-slate-300 rounded p-3 text-sm font-mono focus:outline-none focus:border-blue-500 resize-none shadow-inner" 
            placeholder="Dán (Paste) dữ liệu từ Excel vào đây..." 
            value={pasteData} 
            onChange={e => setPasteData(e.target.value)}
          ></textarea>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
          <span className="text-xs text-slate-400 my-auto mr-auto hidden sm:block">Phím tắt: Esc (Thoát), Ctrl + Enter (Xác nhận)</span>
          <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-sm font-medium border rounded hover:bg-slate-50 transition-colors">Hủy</button>
          <button onClick={processImport} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2 transition-transform active:scale-95">
            <CheckCircle2 size={16}/> Lưu Hệ thống
          </button>
        </div>
      </div>
    </div>
  );
}
