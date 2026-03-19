// src/components/Tabs/TableTab.jsx

import React from 'react';

export default function TableTab({
  allocations = [],
  onRemoveAllocation = () => {},
  onEditAllocation = () => {}
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Bảng phân bổ</h2>
        <p className="text-sm text-slate-500">Danh sách các phiên đã được phân bổ.</p>
      </div>

      <div className="overflow-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Lớp</th>
              <th className="px-4 py-3">Giảng viên</th>
              <th className="px-4 py-3">Phòng</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allocations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                  Chưa có phiên nào được phân bổ.
                </td>
              </tr>
            ) : (
              allocations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{item.className}</td>
                  <td className="px-4 py-3">{item.instructor}</td>
                  <td className="px-4 py-3">{item.room}</td>
                  <td className="px-4 py-3">{item.time}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="mr-2 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
                      onClick={() => onEditAllocation(item)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="rounded bg-rose-50 px-2 py-1 text-xs text-rose-600 hover:bg-rose-100"
                      onClick={() => onRemoveAllocation(item)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
