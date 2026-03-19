// src/components/Tabs/DataTab.jsx

import React from 'react';

export default function DataTab({ type, data, onUpdateItem = () => {}, onDeleteItem = () => {} }) {
  const title = type === 'DATA_CLASS' ? 'Danh sách lớp' : type === 'DATA_ROOM' ? 'Danh sách phòng' : 'Dữ liệu';

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <span className="text-sm text-slate-500">Tổng: {data?.length ?? 0}</span>
      </header>

      <div className="rounded border border-slate-200 bg-white p-4">
        {data?.length === 0 ? (
          <div className="text-sm text-slate-500">Chưa có dữ liệu để hiển thị.</div>
        ) : (
          <ul className="space-y-2">
            {data.map((item) => (
              <li
                key={item.id ?? item.name ?? item}
                className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <div>
                  {type === 'DATA_CLASS' ? (
                    <>
                      <div className="text-sm font-medium text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-600">{item.major}</div>
                    </>
                  ) : type === 'DATA_ROOM' ? (
                    <div className="text-sm font-medium text-slate-900">{item.name}</div>
                  ) : (
                    <div className="text-sm font-medium text-slate-900">{item}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
                    onClick={() => onUpdateItem(item)}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="rounded bg-rose-50 px-2 py-1 text-xs text-rose-600 hover:bg-rose-100"
                    onClick={() => onDeleteItem(item)}
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
