import React from 'react';
import { LayoutTemplate, ListChecks, Info, Users, UserCircle, Plus, Wand2 } from 'lucide-react';
import { DAYS, HOURS, TAB_ALL } from '../../constants/data';

export default function VisualTab({
  classes,
  sessions,
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
  executeAutoSchedule,
  openSessionModal
}) {
  const unassignedClasses = classes.filter(c => !c.isAssigned && (activeInstructorTab === TAB_ALL || c.instructor === activeInstructorTab));
  const uniqueInstructorsForTab = [TAB_ALL, ...instructors];

  return (
    <div className="flex flex-1 gap-4 overflow-hidden rounded-b-lg">
      <aside className="w-[340px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2 text-sm"><LayoutTemplate size={16}/> Hàng đợi chưa phân bổ</h2>
          <button 
            onClick={() => { setIsMultiSelectMode(!isMultiSelectMode); setSidebarSelection([]); }}
            className={`p-1.5 rounded transition-colors ${isMultiSelectMode ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200'}`}
            title="Chế độ chọn nhiều"
          >
            <ListChecks size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50 custom-scrollbar">
          {unassignedClasses.length === 0 ? <div className="text-center text-sm text-slate-500 py-10 italic">Hàng đợi rỗng</div> : 
            unassignedClasses.map(cls => {
              const isSelected = sidebarSelection.includes(cls.id);
              return (
                <div 
                  key={cls.id} 
                  draggable={!isMultiSelectMode}
                  onDragStart={(e) => !isMultiSelectMode && handleDragStartClass(e, cls.id)}
                  onClick={() => {
                    if (isMultiSelectMode) {
                      setSidebarSelection(prev => prev.includes(cls.id) ? prev.filter(id => id !== cls.id) : [...prev, cls.id]);
                    }
                  }}
                  className={`p-2.5 bg-white border rounded-md text-sm transition-all relative group flex gap-2 items-start
                    ${isMultiSelectMode ? 'cursor-pointer hover:border-blue-400' : 'hover:border-blue-400 hover:shadow-sm cursor-grab active:cursor-grabbing'}
                    ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' : 'border-slate-200'}
                  `}
                >
                  {isMultiSelectMode && (
                    <div className="mt-0.5">
                      <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 truncate pr-5" title={cls.name}>{cls.name}</div>
                    {cls.description && <Info size={14} className="absolute top-2.5 right-2 text-slate-400 cursor-help" title={`Mô tả: ${cls.description}`} />}
                    <div className="flex justify-between items-center text-slate-500 mt-1.5 border-t border-slate-100 pt-1.5">
                      <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded"><Users size={12}/> {cls.students}</span>
                      <span className="flex items-center gap-1 text-[11px] truncate max-w-[130px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded" title={cls.major}>{cls.major}</span>
                    </div>
                    {activeInstructorTab === TAB_ALL && <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 truncate" title={cls.instructor}><UserCircle size={12}/> GV: {cls.instructor}</div>}
                  </div>
                </div>
              );
            })
          }
        </div>
        {isMultiSelectMode && sidebarSelection.length > 0 && (
          <div className="p-3 border-t border-slate-200 bg-blue-50">
            <button 
              onClick={executeAutoSchedule}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Wand2 size={16} /> Tự động phân bổ ({sidebarSelection.length} lớp)
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="p-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-4 justify-between">
          <div className="flex gap-2 overflow-x-auto custom-scrollbar">
            {uniqueInstructorsForTab.map(inst => (
              <button key={inst} onClick={() => setActiveInstructorTab(inst)} className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded border transition-colors ${activeInstructorTab === inst ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{inst}</button>
            ))}
          </div>
          <input type="text" value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="border border-slate-300 rounded px-2 py-1.5 text-xs w-40 focus:border-blue-500 focus:outline-none" placeholder="Lọc tên phòng..." />
        </div>

        <div className="flex-1 overflow-auto relative bg-slate-100 custom-scrollbar">
          <div className="min-w-[1000px]">
            <div className="flex sticky top-0 z-20 bg-white border-b border-slate-300 shadow-sm">
              <div className="w-16 shrink-0 border-r border-slate-200 bg-slate-50"></div>
              {DAYS.map((day, idx) => <div key={idx} className={`flex-1 p-2 text-center text-sm font-bold border-r border-slate-200 ${(idx === 5 || idx === 6) ? 'text-amber-700 bg-amber-50' : 'text-slate-700'}`}>{day}</div>)}
            </div>

            {HOURS.map(hour => (
              <div key={hour} className="flex border-b border-slate-200">
                <div className="w-16 shrink-0 bg-slate-50 border-r border-slate-200 flex items-center justify-center text-xs font-medium text-slate-500 relative">
                  <span className="absolute -top-2.5 bg-slate-50 px-1">{`${hour}:00`}</span>
                </div>
                
                {DAYS.map((_, dayIdx) => {
                  const slotSessions = sessions.filter(s => s.dayIndex === dayIdx && s.startHour === hour);
                  const visibleSessions = slotSessions.filter(s => {
                    return (!roomFilter || s.roomName.toLowerCase().includes(roomFilter.toLowerCase())) &&
                           (activeInstructorTab === TAB_ALL || s.instructor === activeInstructorTab);
                  });

                  return (
                    <div 
                      key={`${dayIdx}-${hour}`} 
                      className="flex-1 relative border-r border-slate-200 p-1 min-h-[85px] group bg-white hover:bg-blue-50 cursor-pointer min-w-0 transition-colors"
                      onClick={() => openSessionModal(dayIdx, hour, null)}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-blue-100'); }}
                      onDragLeave={(e) => { e.currentTarget.classList.remove('bg-blue-100'); }}
                      onDrop={(e) => {
                        e.currentTarget.classList.remove('bg-blue-100');
                        handleDropOnGrid(e, dayIdx, hour);
                      }}
                    >
                      <div className="w-full h-full flex flex-col gap-1 overflow-y-auto relative z-10 custom-scrollbar pr-1">
                        {visibleSessions.map(session => {
                          const classNames = session.classIds.map(id => classes.find(c=>c.id===id)?.name).filter(Boolean);
                          const fullString = classNames.join(', ');

                          return (
                            <div 
                              key={session.id} 
                              draggable
                              onDragStart={(e) => { e.stopPropagation(); handleDragStartSession(e, session.id); }}
                              onClick={(e) => { e.stopPropagation(); openSessionModal(dayIdx, hour, session.id); }}
                              className="bg-blue-50 border border-blue-300 rounded p-1.5 shadow-sm flex flex-col transition-transform hover:-translate-y-0.5 cursor-grab active:cursor-grabbing w-full overflow-hidden"
                            >
                              <div className="flex justify-between items-start mb-0.5 gap-1">
                                <div className="font-bold text-blue-900 text-[11px] truncate max-w-[70%]" title={session.roomName}>{session.roomName}</div>
                                <div className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1 rounded whitespace-nowrap">{session.totalStudents} SV</div>
                              </div>
                              <div className="text-[10px] font-medium text-amber-700 truncate bg-amber-50 px-1 w-fit rounded my-0.5 max-w-full" title={session.instructor}>{session.instructor}</div>
                              <div className="text-[10px] text-slate-600 truncate border-t border-blue-200/70 mt-1 pt-1 w-full block" title={fullString}>
                                {fullString}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        {visibleSessions.length === 0 && <Plus className="text-blue-300" size={24}/>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
