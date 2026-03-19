import React, { useState } from 'react';
import { Filter, ArrowUpDown, Trash2, CalendarX2 } from 'lucide-react';
import { DAYS, PERIODS } from '../../constants/data';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

export default function TableTab({
  classes,
  sessions,
  tableSearch,
  setTableSearch,
  sortConfig,
  requestSort,
  applySort,
  rooms,
  updateClassSessionInline,
  selectedTableRows,
  setSelectedTableRows,
  handleBulkTableAction
}) {
  const { currentUser } = useAuth();
  const [lastSelectedRowId, setLastSelectedRowId] = useState(null);
  
  const handleSelectRow = (id, e) => {
    if (e && e.shiftKey && lastSelectedRowId) {
      const currentIndex = filteredItems.findIndex(c => c.id === id);
      const lastIndex = filteredItems.findIndex(c => c.id === lastSelectedRowId);
      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        const rangeIds = filteredItems.slice(start, end + 1).map(c => c.id);
        setSelectedTableRows(prev => [...new Set([...prev, ...rangeIds])]);
        return;
      }
    }
    setSelectedTableRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    setLastSelectedRowId(id);
  };
  
  const handleSelectAll = (allIds, checked) => setSelectedTableRows(checked ? allIds : []);

  const [columnFilters, setColumnFilters] = useState({
    name: '', students: '', instructor: '', isAssigned: '', roomName: '', sessionText: ''
  });

  const handleFilterChange = (key, value) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredItems = applySort(
    classes.map(cls => {
      const session = sessions.find(s => s.classIds.includes(cls.id));
      return { 
        ...cls, 
        sessionObj: session,
        roomName: session ? session.roomName : '', 
        sessionText: session ? `${session.date ? format(new Date(session.date), 'dd/MM/yyyy') : DAYS[session.dayIndex]} - ${PERIODS.find(p=>p.id===session.periodId)?.name}` : '-' 
      };
    }).filter(cls => {
      const matchesSearch = cls.name.toLowerCase().includes(tableSearch.toLowerCase()) || cls.instructor.toLowerCase().includes(tableSearch.toLowerCase());
      const matchesName = cls.name.toLowerCase().includes(columnFilters.name.toLowerCase());
      const matchesStudents = !columnFilters.students || cls.students.toString().includes(columnFilters.students);
      const matchesInstructor = cls.instructor.toLowerCase().includes(columnFilters.instructor.toLowerCase());
      
      let matchesStatus = true;
      if (columnFilters.isAssigned === 'YES') matchesStatus = cls.isAssigned;
      else if (columnFilters.isAssigned === 'NO') matchesStatus = !cls.isAssigned;

      const matchesRoom = cls.roomName.toLowerCase().includes(columnFilters.roomName.toLowerCase());
      const matchesTime = cls.sessionText.toLowerCase().includes(columnFilters.sessionText.toLowerCase());

      return matchesSearch && matchesName && matchesStudents && matchesInstructor && matchesStatus && matchesRoom && matchesTime;
    })
  );
  
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden p-4" id="table-container">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-700">Bộ lọc nâng cao (Trạng thái phân bổ)</h2>
          {currentUser && selectedTableRows.length > 0 && (
            <div className="flex gap-2 ml-4">
              <button onClick={() => handleBulkTableAction('UNASSIGNED')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded text-sm font-medium transition-colors">
                <CalendarX2 size={16} /> Hủy phân bổ ({selectedTableRows.length})
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tra cứu tên lớp, giảng viên..." 
            value={tableSearch} 
            onChange={e => setTableSearch(e.target.value)} 
            className="pl-8 pr-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 w-64" 
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar border border-slate-200 rounded">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 sticky top-0 text-slate-700 border-b border-slate-200 shadow-sm z-10">
            <tr>
              <th className="px-4 py-3 w-10">
                 {currentUser && (
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        const allIds = filteredItems.map(c => c.id);
                        handleSelectAll(allIds, e.target.checked);
                      }} 
                      checked={selectedTableRows.length > 0 && selectedTableRows.length === filteredItems.length}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300" 
                    />
                 )}
              </th>
              {[
                { label: 'Tên Lớp', key: 'name' }, { label: 'Sĩ số', key: 'students' }, 
                { label: 'Giảng viên', key: 'instructor' }, { label: 'Trạng thái', key: 'isAssigned' }, 
                { label: 'Phòng', key: 'roomName' }
              ].map((col, idx) => (
                <th key={idx} className="px-4 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => requestSort(col.key)}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={12} className={sortConfig.key === col.key ? 'text-blue-600' : 'text-slate-400 opacity-50'} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 font-semibold">Thời gian (Ca họp)</th>
            </tr>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-4 py-2"></th>
              <th className="px-2 py-1"><input type="text" placeholder="Lọc Tên..." value={columnFilters.name} onChange={e => handleFilterChange('name', e.target.value)} className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-normal focus:border-blue-500 outline-none" /></th>
              <th className="px-2 py-1"><input type="text" placeholder="Sĩ số..." value={columnFilters.students} onChange={e => handleFilterChange('students', e.target.value)} className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-normal focus:border-blue-500 outline-none" /></th>
              <th className="px-2 py-1"><input type="text" placeholder="Lọc GV..." value={columnFilters.instructor} onChange={e => handleFilterChange('instructor', e.target.value)} className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-normal focus:border-blue-500 outline-none" /></th>
              <th className="px-2 py-1">
                <select value={columnFilters.isAssigned} onChange={e => handleFilterChange('isAssigned', e.target.value)} className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-normal focus:border-blue-500 bg-white outline-none">
                  <option value="">Tất cả</option>
                  <option value="YES">Đã xếp</option>
                  <option value="NO">Chưa xếp</option>
                </select>
              </th>
              <th className="px-2 py-1"><input type="text" placeholder="Lọc Phòng..." value={columnFilters.roomName} onChange={e => handleFilterChange('roomName', e.target.value)} className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-normal focus:border-blue-500 outline-none" /></th>
              <th className="px-2 py-1"><input type="text" placeholder="Lọc Thời gian..." value={columnFilters.sessionText} onChange={e => handleFilterChange('sessionText', e.target.value)} className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs font-normal focus:border-blue-500 outline-none" /></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(cls => (
              <tr 
                key={cls.id} 
                className={`border-b border-slate-100 transition-colors ${selectedTableRows.includes(cls.id) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-slate-50 cursor-pointer'}`}
                onClick={(e) => {
                  if (currentUser && e.target.tagName !== 'SELECT' && e.target.tagName !== 'OPTION') {
                    handleSelectRow(cls.id, e);
                  }
                }}
              >
                <td className="px-4 py-3">
                  {currentUser && (
                    <input type="checkbox" checked={selectedTableRows.includes(cls.id)} onChange={(e) => { e.stopPropagation(); handleSelectRow(cls.id, e); }} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{cls.name}</td>
                <td className="px-4 py-3 text-slate-600">{cls.students}</td>
                <td className="px-4 py-3 text-slate-600">{cls.instructor}</td>
                <td className="px-4 py-3">
                  {currentUser ? (
                    <select 
                      value={cls.isAssigned ? 'ASSIGNED' : 'UNASSIGNED'} 
                      onChange={(e) => updateClassSessionInline(cls.id, e.target.value, null, null, null)}
                      className={`px-2 py-1 rounded text-xs font-medium border focus:outline-none ${cls.isAssigned ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                    >
                      <option value="ASSIGNED">Đã xếp lịch</option>
                      <option value="UNASSIGNED">Chưa xếp</option>
                    </select>
                  ) : (
                    cls.isAssigned ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Đã xếp lịch</span> : <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">Chưa xếp lịch</span>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-blue-700">
                  {currentUser && cls.isAssigned && cls.sessionObj ? (
                    <select 
                      value={cls.sessionObj.roomName} 
                      onChange={(e) => updateClassSessionInline(cls.id, 'UPDATE', e.target.value, cls.sessionObj.dayIndex, cls.sessionObj.periodId)}
                      className="px-2 py-1 text-xs border border-slate-300 rounded focus:border-blue-500 focus:outline-none max-w-[120px]"
                    >
                      {rooms?.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  ) : (cls.roomName || '-')}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {currentUser && cls.isAssigned && cls.sessionObj ? (
                    <div className="flex gap-1">
                      <select 
                        value={cls.sessionObj.dayIndex} 
                        onChange={(e) => updateClassSessionInline(cls.id, 'UPDATE', cls.sessionObj.roomName, parseInt(e.target.value), cls.sessionObj.periodId)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                      >
                        {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                      </select>
                      <select 
                        value={cls.sessionObj.periodId} 
                        onChange={(e) => updateClassSessionInline(cls.id, 'UPDATE', cls.sessionObj.roomName, cls.sessionObj.dayIndex, parseInt(e.target.value))}
                        className="px-2 py-1 text-xs border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                      >
                        {PERIODS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  ) : (cls.sessionText)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
