import React from 'react';
import { Upload, Trash2, ArrowUpDown, Plus, Save, Edit2, CheckSquare, X } from 'lucide-react';

export default function DataTab({
  type,
  classes,
  rooms,
  instructors,
  sessions,
  selectedRows,
  editingId,
  editFormData,
  sortConfig,
  applySort,
  requestSort,
  handleSelectRow,
  handleSelectAll,
  handleBulkDelete,
  newClassData, setNewClassData, handleAddClassInline,
  newRoomData, setNewRoomData, handleAddRoomInline,
  newInstructorName, setNewInstructorName, handleAddInstructorInline,
  setEditFormData, saveInlineEdit, setEditingId, startInlineEdit, deleteSingle,
  setIsImportModalOpen
}) {
  let rawData = []; let columns = []; let title = '';
  
  if (type === 'DATA_CLASS') { 
    title = 'Dữ liệu Lớp học'; rawData = classes; 
    columns = [
      { label: 'Tên Lớp', key: 'name' }, { label: 'Sĩ số', key: 'students' }, 
      { label: 'Ngành', key: 'major' }, { label: 'Giảng viên', key: 'instructor' }, 
      { label: 'Mô tả', key: 'description' }
    ]; 
  } 
  else if (type === 'DATA_ROOM') { 
    title = 'Dữ liệu Cơ sở vật chất'; rawData = rooms; 
    columns = [{ label: 'Tên Phòng', key: 'name' }, { label: 'Sức chứa (SV)', key: 'capacity' }]; 
  } 
  else { 
    title = 'Dữ liệu Giảng viên'; rawData = instructors.map((name, i) => ({ id: name, name })); 
    columns = [{ label: 'Họ và Tên', key: 'name' }]; 
  }

  const data = applySort(rawData);
  const allIds = data.map(d => d.id);
  const isAllSelected = selectedRows.length === data.length && data.length > 0;

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-700">{title}</h2>
          {selectedRows.length > 0 && <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-200">Đã chọn {selectedRows.length} bản ghi</span>}
        </div>
        <div className="flex gap-2">
          {selectedRows.length > 0 && <button onClick={() => handleBulkDelete(type)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 text-sm font-medium shadow-sm transition-colors"><Trash2 size={16} /> Xóa {selectedRows.length} mục</button>}
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 text-sm font-medium shadow-sm transition-transform active:scale-95"><Upload size={16} /> Import Excel</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto border border-slate-200 rounded custom-scrollbar relative">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 sticky top-0 text-slate-700 border-b border-slate-200 z-10 shadow-sm">
            <tr>
              <th className="px-3 py-3 w-10 text-center border-r border-slate-200">
                <input type="checkbox" checked={isAllSelected} onChange={(e) => handleSelectAll(allIds, e.target.checked)} className="cursor-pointer w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              </th>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => requestSort(col.key)}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={12} className={sortConfig.key === col.key ? 'text-blue-600' : 'text-slate-400 opacity-50'} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 font-semibold w-24 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-blue-50/50 border-b border-blue-100">
              <td className="px-3 py-2 text-center border-r border-slate-200"><Plus size={16} className="text-blue-400 mx-auto"/></td>
              {type === 'DATA_CLASS' && (
                <>
                  <td className="p-2"><input type="text" placeholder="Tên lớp..." value={newClassData.name} onChange={e=>setNewClassData({...newClassData, name: e.target.value})} onKeyDown={e=>e.key==='Enter' && handleAddClassInline()} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-blue-500" /></td>
                  <td className="p-2"><input type="number" placeholder="Sĩ số..." value={newClassData.students} onChange={e=>setNewClassData({...newClassData, students: e.target.value})} onKeyDown={e=>e.key==='Enter' && handleAddClassInline()} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-blue-500" /></td>
                  <td className="p-2"><input type="text" placeholder="Ngành học..." value={newClassData.major} onChange={e=>setNewClassData({...newClassData, major: e.target.value})} onKeyDown={e=>e.key==='Enter' && handleAddClassInline()} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-blue-500" /></td>
                  <td className="p-2">
                    <select value={newClassData.instructor} onChange={e=>setNewClassData({...newClassData, instructor: e.target.value})} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-blue-500 bg-white">
                      <option value="">-- Chọn GV --</option>
                      {instructors.map((inst, i) => <option key={i} value={inst}>{inst}</option>)}
                    </select>
                  </td>
                  <td className="p-2"><input type="text" placeholder="Mô tả..." value={newClassData.description} onChange={e=>setNewClassData({...newClassData, description: e.target.value})} onKeyDown={e=>e.key==='Enter' && handleAddClassInline()} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-blue-500" /></td>
                  <td className="p-2 text-center"><button onClick={handleAddClassInline} className="flex items-center justify-center gap-1 w-full bg-blue-600 text-white px-2 py-1.5 rounded text-xs hover:bg-blue-700 transition-colors shadow-sm"><Save size={14}/> Thêm</button></td>
                </>
              )}
              {type === 'DATA_ROOM' && (
                <>
                  <td className="p-2"><input type="text" placeholder="Tên phòng..." value={newRoomData.name} onChange={e=>setNewRoomData({...newRoomData, name: e.target.value})} onKeyDown={e=>e.key==='Enter' && handleAddRoomInline()} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-blue-500" /></td>
                  <td className="p-2"><input type="number" placeholder="Sức chứa..." value={newRoomData.capacity} onChange={e=>setNewRoomData({...newRoomData, capacity: e.target.value})} onKeyDown={e=>e.key==='Enter' && handleAddRoomInline()} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-blue-500" /></td>
                  <td className="p-2 text-center"><button onClick={handleAddRoomInline} className="flex items-center justify-center gap-1 w-full bg-blue-600 text-white px-2 py-1.5 rounded text-xs hover:bg-blue-700 transition-colors shadow-sm"><Save size={14}/> Thêm</button></td>
                </>
              )}
              {type === 'DATA_INSTRUCTOR' && (
                <>
                  <td className="p-2"><input type="text" placeholder="Họ tên Giảng viên..." value={newInstructorName} onChange={e=>setNewInstructorName(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleAddInstructorInline()} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-blue-500" /></td>
                  <td className="p-2 text-center"><button onClick={handleAddInstructorInline} className="flex items-center justify-center gap-1 w-full bg-blue-600 text-white px-2 py-1.5 rounded text-xs hover:bg-blue-700 transition-colors shadow-sm"><Save size={14}/> Thêm</button></td>
                </>
              )}
            </tr>

            {data.length === 0 ? <tr><td colSpan={columns.length+2} className="text-center py-8 text-slate-500">Chưa có dữ liệu.</td></tr> : null}
            {data.map((item, idx) => {
              const isSelected = selectedRows.includes(item.id);
              const isEditing = editingId === item.id;
              
              return (
                <tr key={item.id || idx} className={`border-b border-slate-100 transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'} ${isEditing ? 'bg-amber-50 shadow-inner' : ''}`}>
                  <td className="px-3 py-2 text-center border-r border-slate-200">
                    <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(item.id)} className="cursor-pointer w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  </td>
                  
                  {isEditing ? (
                    <>
                      {type === 'DATA_CLASS' && (
                        <>
                          <td className="p-1.5"><input type="text" value={editFormData.name} onChange={e=>setEditFormData({...editFormData, name: e.target.value})} className="w-full border rounded px-2 py-1 text-xs focus:border-blue-500 outline-none" /></td>
                          <td className="p-1.5"><input type="number" value={editFormData.students} onChange={e=>setEditFormData({...editFormData, students: e.target.value})} className="w-full border rounded px-2 py-1 text-xs focus:border-blue-500 outline-none" /></td>
                          <td className="p-1.5"><input type="text" value={editFormData.major} onChange={e=>setEditFormData({...editFormData, major: e.target.value})} className="w-full border rounded px-2 py-1 text-xs focus:border-blue-500 outline-none" /></td>
                          <td className="p-1.5">
                            <select value={editFormData.instructor} onChange={e=>setEditFormData({...editFormData, instructor: e.target.value})} className="w-full border rounded px-2 py-1 text-xs bg-white focus:border-blue-500 outline-none">
                              {instructors.map((inst, i) => <option key={i} value={inst}>{inst}</option>)}
                            </select>
                          </td>
                          <td className="p-1.5"><input type="text" value={editFormData.description} onChange={e=>setEditFormData({...editFormData, description: e.target.value})} className="w-full border rounded px-2 py-1 text-xs focus:border-blue-500 outline-none" /></td>
                        </>
                      )}
                      {type === 'DATA_ROOM' && (
                        <>
                          <td className="p-1.5"><input type="text" value={editFormData.name} onChange={e=>setEditFormData({...editFormData, name: e.target.value})} className="w-full border rounded px-2 py-1 text-sm focus:border-blue-500 outline-none" /></td>
                          <td className="p-1.5"><input type="number" value={editFormData.capacity} onChange={e=>setEditFormData({...editFormData, capacity: e.target.value})} className="w-full border rounded px-2 py-1 text-sm focus:border-blue-500 outline-none" /></td>
                        </>
                      )}
                      {type === 'DATA_INSTRUCTOR' && (
                        <td className="p-1.5"><input type="text" value={editFormData.newName} onChange={e=>setEditFormData({...editFormData, newName: e.target.value})} className="w-full border rounded px-2 py-1 text-sm focus:border-blue-500 outline-none" autoFocus/></td>
                      )}
                      <td className="px-2 py-2 text-center flex justify-center gap-1">
                        <button onClick={saveInlineEdit} className="text-green-600 hover:text-green-800 bg-green-50 p-1.5 rounded transition-colors" title="Lưu"><CheckSquare size={16}/></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-red-600 bg-slate-50 p-1.5 rounded transition-colors" title="Hủy"><X size={16}/></button>
                      </td>
                    </>
                  ) : (
                    <>
                      {type === 'DATA_CLASS' && (
                        <>
                          <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                          <td className="px-4 py-3">{item.students}</td>
                          <td className="px-4 py-3">{item.major}</td>
                          <td className="px-4 py-3 text-amber-700">{item.instructor}</td>
                          <td className="px-4 py-3 truncate max-w-[200px]" title={item.description}>{item.description}</td>
                        </>
                      )}
                      {type === 'DATA_ROOM' && (
                        <>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-blue-700 font-semibold">{item.capacity}</td>
                        </>
                      )}
                      {type === 'DATA_INSTRUCTOR' && (
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                      )}
                      <td className="px-2 py-2 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => startInlineEdit(type, item)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50 transition-colors" title="Chỉnh sửa"><Edit2 size={16}/></button>
                          <button onClick={() => deleteSingle(type, item.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors" title="Xóa"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
