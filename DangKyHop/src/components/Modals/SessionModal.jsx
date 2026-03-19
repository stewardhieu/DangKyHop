// src/components/Modals/SessionModal.jsx

import React, { useState } from 'react';

export default function SessionModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Tạo lịch họp mới</h3>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tên lịch</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Lịch thi giữa kỳ"
              className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Ngày</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
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
            onClick={() => onSave({ name, date })}
            disabled={!name || !date}
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
}
