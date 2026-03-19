import React, { useState } from 'react';
import { LayoutTemplate, ListChecks, Info, Users, UserCircle, Plus, Wand2, Filter } from 'lucide-react';
import { DAYS, PERIODS, TAB_ALL } from '../../constants/data';
import { useAuth } from '../../contexts/AuthContext';
import { addDays, format } from 'date-fns';

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
  openSessionModal,
  sidebarSearch,
  setSidebarSearch,
  setActiveModal,
  currentWeekStart
}) {
  const { currentUser } = useAuth();
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterMajor, setFilterMajor] = useState('');
  const [filterCohort, setFilterCohort] = useState('');
  const [filterMinStudents, setFilterMinStudents] = useState('');

  const uniqueInstructorsForTab = [TAB_ALL, ...instructors];
  const uniqueMajors = Array.from(new Set(classes.map(c => c.major))).filter(Boolean).sort();
  const uniqueCohorts = Array.from(new Set(classes.map(c=>c.name.split('-')[0]))).filter(Boolean).sort();

  const unassignedClasses = classes.filter(c => {
    if (c.isAssigned) return false;
    if (activeInstructorTab !== TAB_ALL && c.instructor !== activeInstructorTab) return false;
    if (sidebarSearch && !c.name.toLowerCase().includes(sidebarSearch.toLowerCase()) && !c.instructor.toLowerCase().includes(sidebarSearch.toLowerCase())) return false;
    if (filterMajor && c.major !== filterMajor) return false;
    if (filterCohort && !c.name.startsWith(filterCohort)) return false;
    if (filterMinStudents && c.students < parseInt(filterMinStudents)) return false;
    return true;
  });

  return (
    <div className="flex flex-1 gap-4 overflow-hidden rounded-b-lg">
      <aside className="w-[340px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2 text-sm"><LayoutTemplate size={16}/> Hàng đợi chưa phân bổ</h2>
          {currentUser && (
            <button 
              onClick={() => { setIsMultiSelectMode(!isMultiSelectMode); setSidebarSelection([]); }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold shadow-sm transition-all border ${isMultiSelectMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              title="Chế độ chọn nhiều"
            >
              <ListChecks size={14} />
              <span>{isMultiSelectMode ? 'Đóng Chọn' : 'Chọn Nhiều'}</span>
            </button>
          )}
        </div>
        <div className="px-3 py-2 bg-white border-b border-slate-200 flex flex-col gap-2 shadow-sm relative z-10">
          <input 
            type="text" 
            placeholder="Tìm kiếm lớp học, GV..." 
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-blue-500 transition-colors"
          />
          <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="text-xs flex items-center justify-center gap-1 text-slate-500 hover:text-blue-600 font-medium py-1 transition-colors border border-dashed border-slate-300 rounded hover:border-blue-300 bg-slate-50">
            <Filter size={14} /> Lọc nâng cao (Khoa, Khóa, Sĩ số) {showAdvancedFilters ? '▲' : '▼'}
          </button>
          
          {showAdvancedFilters && (
            <div className="flex flex-col gap-2 p-2 bg-slate-50 border border-slate-200 rounded shadow-inner text-xs animate-in slide-in-from-top-2 duration-200">
              <select value={filterMajor} onChange={e => setFilterMajor(e.target.value)} className="border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none bg-white">
                <option value="">-- Tất cả Khoa --</option>
                {uniqueMajors.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex gap-2">
                <select value={filterCohort} onChange={e => setFilterCohort(e.target.value)} className="w-1/2 border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none bg-white">
                  <option value="">-- Tất cả Khóa --</option>
                  {uniqueCohorts.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Sĩ số tối thiểu" value={filterMinStudents} onChange={e=>setFilterMinStudents(e.target.value)} className="w-1/2 border border-slate-300 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none bg-white" min="0" />
              </div>
            </div>
          )}

          {isMultiSelectMode && currentUser && (
            <div className="flex flex-col gap-2 mt-1">
              <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer hover:text-blue-700 transition-colors">
                <input 
                  type="checkbox" 
                  checked={sidebarSelection.length === unassignedClasses.length && unassignedClasses.length > 0}
                  onChange={(e) => setSidebarSelection(e.target.checked ? unassignedClasses.map(c => c.id) : [])}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                Chọn tất cả lớp đang hiển thị ({unassignedClasses.length})
              </label>
              {sidebarSelection.length > 0 && (
                <button 
                  onClick={() => setActiveModal({ type: 'auto_schedule' })}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white px-3 py-2 rounded shadow-sm hover:bg-amber-700 transition-colors font-medium text-sm border border-amber-700"
                >
                  <Wand2 size={16} /> Phân bổ Tự động ({sidebarSelection.length})
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50 custom-scrollbar relative">
          {unassignedClasses.length === 0 ? <div className="text-center text-sm text-slate-500 py-10 italic">Không tìm thấy lớp nào.</div> : 
            unassignedClasses.map(cls => {
              const isSelected = sidebarSelection.includes(cls.id);
              return (
                <div 
                  key={cls.id} 
                  draggable={!!currentUser && (!isMultiSelectMode || sidebarSelection.includes(cls.id))}
                  onDragStart={(e) => { if(currentUser) handleDragStartClass(e, cls.id); }}
                  onClick={() => {
                    if (currentUser && isMultiSelectMode) {
                      setSidebarSelection(prev => prev.includes(cls.id) ? prev.filter(id => id !== cls.id) : [...prev, cls.id]);
                    }
                  }}
                  className={`p-2.5 bg-white border rounded-md text-sm transition-all relative group flex gap-2 items-start
                    ${!currentUser ? '' : isMultiSelectMode ? 'cursor-pointer hover:border-blue-400' : 'hover:border-blue-400 hover:shadow-sm cursor-grab active:cursor-grabbing'}
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
                    {currentUser && !isMultiSelectMode && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openSessionModal(0, 8, null, [cls.id]); }}
                        className="absolute top-2.5 right-2 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 p-1 rounded transition-colors"
                        title="Xếp lịch trực tiếp"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                    {cls.description && <Info size={14} className={`absolute right-2 text-slate-400 cursor-help ${isMultiSelectMode ? 'top-2.5' : 'top-8'}`} title={`Mô tả: ${cls.description}`} />}
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
      </aside>

      <main className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden" id="visual-grid-container">
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
            <div className="flex sticky top-0 z-20 bg-white border-b border-slate-300 shadow-sm header-row">
              <div className="w-20 shrink-0 border-r border-slate-200 bg-slate-50 sticky left-0 z-30"></div>
              {DAYS.map((day, idx) => {
                const currentDate = currentWeekStart ? addDays(currentWeekStart, idx) : null;
                return (
                  <div key={idx} className={`flex-1 p-2 text-center border-r border-slate-200 ${(idx === 5 || idx === 6) ? 'text-amber-700 bg-amber-50' : 'text-slate-700'}`}>
                    <div className="font-bold text-sm">{day}</div>
                    {currentDate && <div className="text-xs text-slate-500">{format(currentDate, 'dd/MM')}</div>}
                  </div>
                );
              })}
            </div>

            {PERIODS.map(period => (
              <div key={period.id} className="flex border-b border-slate-200 period-row">
                <div className="w-20 shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col items-center justify-center relative sticky left-0 z-10 py-1">
                  <span className="text-xs font-bold text-slate-700">{period.name}</span>
                  <span className="text-[10px] text-slate-500 text-center leading-tight">{period.time}</span>
                </div>
                
                {DAYS.map((_, dayIdx) => {
                  const cellDate = currentWeekStart ? format(addDays(currentWeekStart, dayIdx), 'yyyy-MM-dd') : null;
                  const slotSessions = sessions.filter(s => {
                    const isCorrectPeriod = s.periodId === period.id;
                    if (cellDate && s.date) {
                      return isCorrectPeriod && s.date === cellDate;
                    }
                    if (!s.date && cellDate) {
                       return false; 
                    }
                    return isCorrectPeriod && s.dayIndex === dayIdx;
                  });
                  const visibleSessions = slotSessions.filter(s => {
                    return (!roomFilter || s.roomName.toLowerCase().includes(roomFilter.toLowerCase())) &&
                           (activeInstructorTab === TAB_ALL || s.instructor === activeInstructorTab);
                  });

                  return (
                    <div 
                      key={`${dayIdx}-${period.id}`} 
                      className={`flex-1 relative border-r border-slate-200 p-1 min-h-[85px] group bg-white min-w-0 transition-colors ${currentUser ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
                      onClick={() => { if(currentUser) openSessionModal(dayIdx, period.id, null); }}
                      onDragOver={(e) => { if(currentUser) { e.preventDefault(); e.currentTarget.classList.add('bg-blue-100'); } }}
                      onDragLeave={(e) => { if(currentUser) e.currentTarget.classList.remove('bg-blue-100'); }}
                      onDrop={(e) => {
                        if(currentUser) {
                          e.currentTarget.classList.remove('bg-blue-100');
                          handleDropOnGrid(e, dayIdx, period.id);
                        }
                      }}
                    >
                      <div className="w-full h-full flex flex-col gap-1 overflow-y-auto relative z-10 custom-scrollbar pr-1">
                        {visibleSessions.map(session => {
                          const classNames = session.classIds.map(id => classes.find(c=>c.id===id)?.name).filter(Boolean);
                          const fullString = classNames.join(', ');

                          return (
                            <div 
                              key={session.id} 
                              draggable={!!currentUser}
                              onDragStart={(e) => { if(currentUser) { e.stopPropagation(); handleDragStartSession(e, session.id); } }}
                              onClick={(e) => { if(currentUser) { e.stopPropagation(); openSessionModal(dayIdx, period.id, session.id); } }}
                              className={`bg-blue-50 border border-blue-300 rounded p-1.5 shadow-sm flex flex-col transition-transform w-full overflow-hidden ${currentUser ? 'hover:-translate-y-0.5 cursor-grab active:cursor-grabbing' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-0.5 gap-1">
                                <div className="font-bold text-blue-900 text-[11px] truncate max-w-[70%]" title={session.roomName}>{session.roomName}</div>
                                <div className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1 rounded whitespace-nowrap">{session.totalStudents} SV</div>
                              </div>
                              <div className="text-[10px] font-medium text-amber-700 truncate bg-amber-50 px-1 w-fit rounded my-0.5 max-w-full" title={session.instructor}>{session.instructor}</div>
                              <div className="text-[10px] text-slate-600 break-words border-t border-blue-200/70 mt-1 pt-1 w-full block" title={fullString}>
                                {fullString}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {currentUser && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                          {visibleSessions.length === 0 && <Plus className="text-blue-300" size={24}/>}
                        </div>
                      )}
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
