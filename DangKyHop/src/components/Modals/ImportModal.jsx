// src/components/Modals/ImportModal.jsx

import React from 'react';

export default function ImportModal({ isOpen, onClose, onImport }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Nhập dữ liệu từ Excel</h3>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-slate-600">Chọn file Excel (.xlsx / .xls) để nhập lịch họp.</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="mt-3 w-full rounded border border-slate-200 px-3 py-2 text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImport(file);
              }
            }}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            onClick={onImport}
          >
            Nhập
          </button>
        </div>
      </div>
    </div>
  );
}
