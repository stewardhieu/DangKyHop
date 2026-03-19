// src/components/Tabs/VisualTab.jsx

import React from 'react';
import { LayoutTemplate, ListChecks, Info, Users, UserCircle, Plus, Wand2 } from 'lucide-react';
import { DAYS, HOURS, TAB_ALL } from '../../constants/data';

export default function VisualTab({
  classes,
  sessions,
  rooms,
  instructors,
  activeInstructorTab,
  setActiveInstructorTab,
  roomFilter,
  setRoomFilter,
  sidebarSelection,
  setSidebarSelection,
  isMultiSelectMode,
  setIsMultiSelectMode,
  handleDragStartClass,
  handleDragStartSession,
  handleDropOnGrid,
  openSessionModal,
  executeAutoSchedule
}) {
  const unassignedClasses = classes.filter(
    (c) => !c.isAssigned && (activeInstructorTab === TAB_ALL || c.instructor === activeInstructorTab)
  );
  const uniqueInstructorsForTab = [TAB_ALL, ...instructors];

  return (
    <div className="flex flex-1 gap-4 overflow-hidden rounded-b-lg">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" />
              <span className="text-sm font-medium">Danh sách lớp</span>
            </div>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-700"
              onClick={() => setIsMultiSelectMode((prev) => !prev)}
            >
              {isMultiSelectMode ? 'Hủy chọn nhiều' : 'Chọn nhiều'}
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {uniqueInstructorsForTab.map((instructor) => (
              <button
                key={instructor}
                type="button"
                className={`w-full text-left rounded px-2 py-1 text-sm ${
                  instructor === activeInstructorTab
                    ? 'bg-slate-100 font-semibold text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setActiveInstructorTab(instructor)}
              >
                {instructor}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ListChecks className="h-4 w-4" />
              <span>{unassignedClasses.length} lớp chưa phân bổ</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
              onClick={openSessionModal}
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm lịch
            </button>
          </div>

          <ul className="space-y-2">
            {unassignedClasses.length === 0 ? (
              <li className="rounded border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                Không có lớp nào để phân bổ.
              </li>
            ) : (
              unassignedClasses.map((clazz) => (
                <li
                  key={clazz.id}
                  draggable
                  onDragStart={(e) => handleDragStartClass(e, clazz)}
                  className="rounded border border-slate-200 bg-white p-3 shadow-sm hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{clazz.name}</div>
                      <div className="text-xs text-slate-500">{clazz.major}</div>
                    </div>
                    <div className="text-xs text-slate-500">{clazz.students} SV</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            onClick={executeAutoSchedule}
          >
            <Wand2 className="h-4 w-4" />
            Auto Schedule
          </button>
        </div>
      </aside>

      {/* Main visual grid placeholder */}
      <main className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Users className="h-4 w-4" />
            <span>Lịch trực quan</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="h-4 w-4" />
            <span>Kéo thả lớp vào lưới để phân bổ.</span>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">
            {/* Placeholder grid: in your app this should be your drag/drop schedule grid */}
            <div className="text-sm font-medium text-slate-700">Lưới phân bổ (chưa triển khai)</div>
            <div className="mt-2 text-xs text-slate-500">
              Kéo lớp từ bên trái và thả vào ô tương ứng để tạo phiên.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
