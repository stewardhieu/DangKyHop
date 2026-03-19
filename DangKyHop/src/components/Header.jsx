// src/components/Header.jsx

import React from 'react';
import { Undo2, Redo2, Calendar, Settings2, Database } from 'lucide-react';

export default function Header({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenImport,
  onOpenSettings,
  title = 'Quản lý lịch họp'
}) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-sky-600" />
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">Tạo, phân bổ và quản lý lịch họp dễ dàng.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 className="h-4 w-4" />
          Hoàn tác
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 className="h-4 w-4" />
          Làm lại
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          onClick={onOpenImport}
        >
          <Database className="h-4 w-4" />
          Nhập dữ liệu
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          onClick={onOpenSettings}
        >
          <Settings2 className="h-4 w-4" />
          Cài đặt
        </button>
      </div>
    </header>
  );
}
