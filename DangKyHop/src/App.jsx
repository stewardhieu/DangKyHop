import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Database, TableProperties, Settings2, UserCircle } from 'lucide-react';
import { DAYS, HOURS, TAB_ALL, MOCK_CLASSES, MOCK_ROOMS, MOCK_INSTRUCTORS } from './constants/data';

import Header from './components/Header';
import VisualTab from './components/Tabs/VisualTab';
import TableTab from './components/Tabs/TableTab';
import DataTab from './components/Tabs/DataTab';
import ImportModal from './components/Modals/ImportModal';
import SessionModal from './components/Modals/SessionModal';
import AutoScheduleModal from './components/Modals/AutoScheduleModal';

export default function App() {
  const [history, setHistory] = useState([{ classes: MOCK_CLASSES, sessions: [], rooms: MOCK_ROOMS, instructors: MOCK_INSTRUCTORS }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentData = history[historyIndex] || history[0];
  const { classes, sessions, rooms, instructors } = currentData;

  const [mainTab, setMainTab] = useState('VISUAL');
  const [roomFilter, setRoomFilter] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [activeInstructorTab, setActiveInstructorTab] = useState(TAB_ALL);
  const [sidebarSelection, setSidebarSelection] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [pasteData, setPasteData] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // DATA TAB States
  const [newClassData, setNewClassData] = useState({ name: '', students: '', major: '', instructor: '', description: '' });
  const [newRoomData, setNewRoomData] = useState({ name: '', capacity: '' });
  const [newInstructorName, setNewInstructorName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // MODAL States
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({ roomName: '', instructor: '', selectedClassIds: [], isNewRoom: false, newRoomName: '', newRoomCapacity: 150 });

  const saveState = useCallback((newClasses, newSessions, newRooms = rooms, newInstructors = instructors) => {
    const newState = { classes: newClasses, sessions: newSessions, rooms: newRooms, instructors: newInstructors };
    const newHistory = [...history.slice(0, historyIndex + 1), newState];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, rooms, instructors]);

  const handleUndo = () => { if (historyIndex > 0) setHistoryIndex(prev => prev - 1); };
  const handleRedo = () => { if (historyIndex < history.length - 1) setHistoryIndex(prev => prev + 1); };

  // --- CRUD: INLINE EDITING & DELETION ---
  const handleAddClassInline = () => {
    if (!newClassData.name.trim() || !newClassData.students) return;
    const n = { id: `C_INL_${Date.now()}`, name: newClassData.name.trim(), students: parseInt(newClassData.students)||0, major: newClassData.major, instructor: newClassData.instructor, description: newClassData.description, isAssigned: false };
    saveState([...classes, n], sessions);
    setNewClassData({ name: '', students: '', major: '', instructor: '', description: '' });
  };

  const handleAddRoomInline = () => {
    if (!newRoomData.name.trim() || !newRoomData.capacity) return;
    saveState(classes, sessions, [...rooms, { id: `R_INL_${Date.now()}`, name: newRoomData.name.trim(), capacity: parseInt(newRoomData.capacity)||0 }]);
    setNewRoomData({ name: '', capacity: '' });
  };

  const handleAddInstructorInline = () => {
    if (!newInstructorName.trim()) return;
    saveState(classes, sessions, rooms, [...instructors, newInstructorName.trim()]);
    setNewInstructorName('');
  };

  const startInlineEdit = (type, item) => {
    setEditingId(item.id || item);
    if (type === 'DATA_CLASS') setEditFormData({ ...item });
    else if (type === 'DATA_ROOM') setEditFormData({ ...item });
    else setEditFormData({ newName: item.name });
  };

  const saveInlineEdit = () => {
    if (mainTab === 'DATA_CLASS') saveState(classes.map(c => c.id === editingId ? { ...c, ...editFormData, students: parseInt(editFormData.students)||0 } : c), sessions);
    else if (mainTab === 'DATA_ROOM') saveState(classes, sessions, rooms.map(r => r.id === editingId ? { ...r, ...editFormData, capacity: parseInt(editFormData.capacity)||0 } : r));
    else if (mainTab === 'DATA_INSTRUCTOR') {
      const oldName = editingId; const nn = editFormData.newName.trim();
      saveState(classes.map(c => c.instructor === oldName ? {...c, instructor: nn} : c), sessions.map(s => s.instructor === oldName ? {...s, instructor: nn} : s), rooms, instructors.map(i => i === oldName ? nn : i));
    }
    setEditingId(null);
  };

  const deleteSingle = (type, id) => {
    if (type === 'DATA_CLASS') saveState(classes.filter(c => c.id !== id), sessions.map(s => ({ ...s, classIds: s.classIds.filter(cid => cid !== id) })).filter(s => s.classIds.length > 0));
    else if (type === 'DATA_ROOM') saveState(classes, sessions.filter(s => s.roomName !== rooms.find(r=>r.id===id)?.name), rooms.filter(r => r.id !== id));
    else if (type === 'DATA_INSTRUCTOR') saveState(classes.map(c => c.instructor === id ? {...c, instructor: ''} : c), sessions.filter(s => s.instructor !== id), rooms, instructors.filter(i => i !== id));
  };

  const handleBulkDelete = (type) => {
    if (selectedRows.length === 0) return;
    if (type === 'DATA_CLASS') saveState(classes.filter(c => !selectedRows.includes(c.id)), sessions.map(s => ({ ...s, classIds: s.classIds.filter(cid => !selectedRows.includes(cid)) })).filter(s => s.classIds.length > 0));
    else if (type === 'DATA_ROOM') saveState(classes, sessions.filter(s => !selectedRows.includes(rooms.find(r=>r.id===s.roomName)?.id)), rooms.filter(r => !selectedRows.includes(r.id)));
    setSelectedRows([]);
  };

  const handleSelectRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  const handleSelectAll = (allIds, checked) => setSelectedRows(checked ? allIds : []);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const applySort = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const processImport = () => {
    if (!pasteData.trim()) return;
    const lines = pasteData.trim().split('\n').map(l => l.split('\t').map(c => c.trim()));
    if (mainTab === 'DATA_CLASS') {
      const newCls = lines.map(cols => cols.length >= 2 ? { id: `C_IMP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, name: cols[0], students: parseInt(cols[1])||0, major: cols[2]||'', instructor: cols[3]||'', description: cols[4]||'', isAssigned: false } : null).filter(Boolean);
      saveState([...classes, ...newCls], sessions);
    } else if (mainTab === 'DATA_ROOM') {
      const newRms = lines.map(cols => cols.length >= 2 ? { id: `R_IMP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, name: cols[0], capacity: parseInt(cols[1])||0 } : null).filter(Boolean);
      saveState(classes, sessions, [...rooms, ...newRms]);
    } else if (mainTab === 'DATA_INSTRUCTOR') {
      const newInsts = lines.map(cols => cols[0]).filter(Boolean);
      saveState(classes, sessions, rooms, [...new Set([...instructors, ...newInsts])]);
    }
    setPasteData(''); setIsImportModalOpen(false);
  };

  // --- DRAG & DROP LOGIC ---
  const handleDragStartClass = (e, classId) => {
    let ids = [classId];
    if (isMultiSelectMode && sidebarSelection.includes(classId)) {
      ids = sidebarSelection;
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'class', ids }));
  };
  const handleDragStartSession = (e, sessionId) => e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'session', id: sessionId }));
  
  const handleDropOnGrid = (e, dayIndex, startHour) => {
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;
    const data = JSON.parse(dataStr);
    
    if (data.type === 'class') {
      const validIds = data.ids.filter(id => classes.some(c => c.id === id));
      if (validIds.length > 0) openSessionModal(dayIndex, startHour, null, validIds);
    } else if (data.type === 'session') {
      const targetSession = sessions.find(s => s.id === data.id);
      if (targetSession) saveState(classes, sessions.map(s => s.id === targetSession.id ? { ...s, dayIndex, startHour } : s));
    }
  };

  // --- MODAL LOGIC (CREATE & EDIT SESSION) ---
  const openSessionModal = (dayIndex = 0, startHour = 8, existingSessionId = null, initialClassIds = []) => {
    if (existingSessionId) {
      const session = sessions.find(s => s.id === existingSessionId);
      setFormData({ roomName: session.roomName, instructor: session.instructor, selectedClassIds: session.classIds, isNewRoom: false, newRoomName: '', newRoomCapacity: 150, dayIndex: session.dayIndex, hour: session.startHour });
      setActiveModal({ type: 'create_session', dayIndex, hour: startHour, existingSessionId });
    } else {
      setFormData({ roomName: '', instructor: '', selectedClassIds: initialClassIds, isNewRoom: false, newRoomName: '', newRoomCapacity: 150, dayIndex: dayIndex ?? 0, hour: startHour ?? 8 });
      setActiveModal({ type: 'create_session', dayIndex, hour: startHour, existingSessionId: null });
    }
  };

  const toggleClassSelection = (classId) => {
    setFormData(prev => ({
      ...prev,
      selectedClassIds: prev.selectedClassIds.includes(classId) ? prev.selectedClassIds.filter(id => id !== classId) : [...prev.selectedClassIds, classId]
    }));
  };

  const saveSession = () => {
    if ((!formData.isNewRoom && !formData.roomName) || (formData.isNewRoom && !formData.newRoomName) || formData.selectedClassIds.length === 0 || !formData.instructor) {
      alert("Vui lòng điền đủ: Phòng họp, Giảng viên và chọn ít nhất 1 lớp."); return;
    }
    
    const finalRoomName = formData.isNewRoom ? formData.newRoomName.trim() : formData.roomName;
    const roomCapacity = formData.isNewRoom ? (parseInt(formData.newRoomCapacity) || 150) : (rooms.find(r=>r.name === finalRoomName)?.capacity || 150);
    const currentStudents = formData.selectedClassIds.reduce((sum, id) => sum + (classes.find(c=>c.id===id)?.students||0), 0);
    
    if (currentStudents > roomCapacity) {
      if(!window.confirm(`Vượt quá sức chứa phòng ${finalRoomName} (${currentStudents}/${roomCapacity}). Bạn có chắc chắn muốn lấp lịch này?`)) return;
    }

    let newSessions = [...sessions];
    let newClasses = classes.map(c => ({ ...c }));
    let newRooms = [...rooms];

    if (formData.isNewRoom && !rooms.some(r => r.name.toLowerCase() === finalRoomName.toLowerCase())) {
      newRooms.push({ id: `R_INL_${Date.now()}`, name: finalRoomName, capacity: roomCapacity });
    }

    if (activeModal.existingSessionId) {
      const oldSession = newSessions.find(s => s.id === activeModal.existingSessionId);
      oldSession.classIds.forEach(cid => { const c = newClasses.find(nc => nc.id === cid); if(c) c.isAssigned = false; });
      newSessions = newSessions.map(s => s.id === activeModal.existingSessionId ? { ...s, roomName: finalRoomName, instructor: formData.instructor, classIds: formData.selectedClassIds, totalStudents: currentStudents, dayIndex: formData.dayIndex, startHour: formData.hour } : s);
    } else {
      newSessions.push({ id: `S_${Date.now()}`, dayIndex: formData.dayIndex, startHour: formData.hour, duration: 1, roomName: finalRoomName, instructor: formData.instructor, classIds: formData.selectedClassIds, totalStudents: currentStudents });
    }
    
    formData.selectedClassIds.forEach(cid => { const c = newClasses.find(nc => nc.id === cid); if(c) c.isAssigned = true; });
    saveState(newClasses, newSessions, newRooms);
    setActiveModal(null);
  };

  const deleteSession = (sessionId) => {
    if(!window.confirm("Hủy lịch họp này và trả các lớp về hàng đợi?")) return;
    const session = sessions.find(s => s.id === sessionId);
    saveState(classes.map(c => session.classIds.includes(c.id) ? { ...c, isAssigned: false } : c), sessions.filter(s => s.id !== sessionId));
    setActiveModal(null);
  };

  // --- AUTO-SCHEDULE ALGORITHM (BIN PACKING) ---
  const executeAutoSchedule = (config) => {
    const { allowedDays, allowedHours, maxClassesPerSession } = config;

    if (sidebarSelection.length === 0) return;
    const classesToSchedule = classes.filter(c => sidebarSelection.includes(c.id));
    const sortedRooms = [...rooms].filter(r => r.id !== 'R_DEFAULT').sort((a, b) => b.capacity - a.capacity); 

    if (sortedRooms.length === 0) {
      alert("Lỗi Hệ thống: Không có dữ liệu Phòng họp thực tế để thực hiện phân bổ."); return;
    }

    const groupedByInst = {};
    classesToSchedule.forEach(c => {
      const inst = c.instructor;
      if (!groupedByInst[inst]) groupedByInst[inst] = [];
      groupedByInst[inst].push(c);
    });

    let newSessions = [...sessions];
    let newClasses = classes.map(c => ({ ...c }));
    let failedToSchedule = [];
    let successCount = 0;

    Object.entries(groupedByInst).forEach(([inst, instClasses]) => {
      instClasses.sort((a, b) => b.students - a.students); 
      let virtualSessions = [];

      instClasses.forEach(cls => {
        let placed = false;
        for (let vs of virtualSessions) {
          if (vs.totalStudents + cls.students <= sortedRooms[0].capacity) {
            if (maxClassesPerSession === 0 || vs.classes.length < maxClassesPerSession) {
              vs.classes.push(cls); vs.totalStudents += cls.students; placed = true; break;
            }
          }
        }
        if (!placed) virtualSessions.push({ classes: [cls], totalStudents: cls.students, instructor: inst });
      });

      virtualSessions.forEach(vs => {
        const validRooms = sortedRooms.filter(r => r.capacity >= vs.totalStudents).sort((a, b) => a.capacity - b.capacity);
        if (validRooms.length === 0) { failedToSchedule.push(...vs.classes.map(c => c.name)); return; }

        let scheduled = false;
        for (let d of allowedDays) {
          for (let h of allowedHours) {
            const instBusy = newSessions.some(s => s.dayIndex === d && s.startHour === h && s.instructor === vs.instructor);
            if (instBusy) continue;

            for (let room of validRooms) {
              const roomBusy = newSessions.some(s => s.dayIndex === d && s.startHour === h && s.roomName === room.name);
              if (!roomBusy) {
                newSessions.push({ id: `S_AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, dayIndex: d, startHour: h, duration: 1, roomName: room.name, instructor: vs.instructor, classIds: vs.classes.map(c => c.id), totalStudents: vs.totalStudents });
                vs.classes.forEach(c => { const target = newClasses.find(nc => nc.id === c.id); if (target) target.isAssigned = true; });
                scheduled = true; successCount += vs.classes.length; break;
              }
            }
            if (scheduled) break;
          }
          if (scheduled) break;
        }
        if (!scheduled) failedToSchedule.push(...vs.classes.map(c => c.name));
      });
    });

    saveState(newClasses, newSessions);
    setSidebarSelection([]); 
    setIsMultiSelectMode(false);
    setActiveModal(null);
    
    if (failedToSchedule.length > 0) {
      alert(`Phân bổ thành công: ${successCount} lớp.\nThất bại: ${failedToSchedule.length} lớp (Nguyên nhân: Hết quỹ phòng trống hoặc Kẹt lịch giảng viên).\nLớp thất bại: ${failedToSchedule.join(', ')}`);
    }
  };

  return (
    <div className="h-screen bg-slate-100 text-slate-900 font-sans p-4 flex flex-col overflow-hidden">
      <Header classes={classes} rooms={rooms} historyIndex={historyIndex} historyLength={history.length} handleUndo={handleUndo} handleRedo={handleRedo} />

      <div className="flex bg-white border border-slate-200 rounded-t-lg shadow-sm overflow-x-auto custom-scrollbar mb-0">
        <button onClick={() => setMainTab('VISUAL')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'VISUAL' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><Calendar size={16}/> Lịch Trực Quan</button>
        <button onClick={() => setMainTab('TABLE')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'TABLE' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><TableProperties size={16}/> Danh sách phân bổ</button>
        <div className="w-px h-6 bg-slate-300 mx-2 self-center"></div>
        <button onClick={() => setMainTab('DATA_CLASS')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'DATA_CLASS' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><Database size={16}/> Dữ liệu Lớp học</button>
        <button onClick={() => setMainTab('DATA_ROOM')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'DATA_ROOM' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><Settings2 size={16}/> Dữ liệu Phòng học</button>
        <button onClick={() => setMainTab('DATA_INSTRUCTOR')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'DATA_INSTRUCTOR' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><UserCircle size={16}/> Dữ liệu Giảng viên</button>
      </div>

      <div className="flex flex-1 overflow-hidden shadow-sm bg-white rounded-b-lg border-x border-b border-slate-200">
        {mainTab === 'VISUAL' && <VisualTab classes={classes} sessions={sessions} instructors={instructors} activeInstructorTab={activeInstructorTab} setActiveInstructorTab={setActiveInstructorTab} roomFilter={roomFilter} setRoomFilter={setRoomFilter} sidebarSelection={sidebarSelection} setSidebarSelection={setSidebarSelection} isMultiSelectMode={isMultiSelectMode} setIsMultiSelectMode={setIsMultiSelectMode} handleDragStartClass={handleDragStartClass} handleDragStartSession={handleDragStartSession} handleDropOnGrid={handleDropOnGrid} executeAutoSchedule={executeAutoSchedule} openSessionModal={openSessionModal} sidebarSearch={sidebarSearch} setSidebarSearch={setSidebarSearch} setActiveModal={setActiveModal} />}
        {mainTab === 'TABLE' && <TableTab classes={classes} sessions={sessions} tableSearch={tableSearch} setTableSearch={setTableSearch} sortConfig={sortConfig} requestSort={requestSort} applySort={applySort} />}
        {(mainTab === 'DATA_CLASS' || mainTab === 'DATA_ROOM' || mainTab === 'DATA_INSTRUCTOR') && <DataTab type={mainTab} classes={classes} rooms={rooms} instructors={instructors} sessions={sessions} selectedRows={selectedRows} editingId={editingId} editFormData={editFormData} sortConfig={sortConfig} requestSort={requestSort} applySort={applySort} handleSelectRow={handleSelectRow} handleSelectAll={handleSelectAll} handleBulkDelete={handleBulkDelete} newClassData={newClassData} setNewClassData={setNewClassData} handleAddClassInline={handleAddClassInline} newRoomData={newRoomData} setNewRoomData={setNewRoomData} handleAddRoomInline={handleAddRoomInline} newInstructorName={newInstructorName} setNewInstructorName={setNewInstructorName} handleAddInstructorInline={handleAddInstructorInline} setEditFormData={setEditFormData} saveInlineEdit={saveInlineEdit} setEditingId={setEditingId} startInlineEdit={startInlineEdit} deleteSingle={deleteSingle} setIsImportModalOpen={setIsImportModalOpen} />}
      </div>

      <ImportModal isImportModalOpen={isImportModalOpen} setIsImportModalOpen={setIsImportModalOpen} mainTab={mainTab} pasteData={pasteData} setPasteData={setPasteData} processImport={processImport} />
      <SessionModal activeModal={activeModal} setActiveModal={setActiveModal} formData={formData} setFormData={setFormData} rooms={rooms} instructors={instructors} classes={classes} sessions={sessions} deleteSession={deleteSession} saveSession={saveSession} toggleClassSelection={toggleClassSelection} />
      <AutoScheduleModal activeModal={activeModal} setActiveModal={setActiveModal} executeAutoSchedule={executeAutoSchedule} sidebarSelectionCount={sidebarSelection.length} />
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
