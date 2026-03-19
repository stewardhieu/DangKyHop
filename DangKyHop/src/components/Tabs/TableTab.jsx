import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import { DAYS, PERIODS } from '../../constants/data';
import { useAuth } from '../../contexts/AuthContext';

export default function TableTab({
  classes,
  sessions,
  tableSearch,
  setTableSearch,
  sortConfig,
  requestSort,
  applySort,
  rooms,
  updateClassSessionInline
}) {
  const { currentUser } = useAuth();
  
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-700">Bộ lọc nâng cao (Trạng thái phân bổ)</h2>
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
          </thead>
          <tbody>
            {applySort(
              classes.filter(c => c.name.toLowerCase().includes(tableSearch.toLowerCase()) || c.instructor.toLowerCase().includes(tableSearch.toLowerCase()))
              .map(cls => {
                const session = sessions.find(s => s.classIds.includes(cls.id));
                return { 
                  ...cls, 
                  sessionObj: session,
                  roomName: session ? session.roomName : '', 
                  sessionText: session ? `${DAYS[session.dayIndex]}, ${PERIODS.find(p=>p.id===session.periodId)?.name}` : '-' 
                };
              })
            ).map(cls => (
              <tr key={cls.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
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
