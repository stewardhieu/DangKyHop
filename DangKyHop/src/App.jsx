import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Undo2, Redo2, Upload, Filter, X, AlertCircle, CheckCircle2, Calendar, Users, LayoutTemplate, UserCircle, Plus, Info, Database, TableProperties, Settings2, Trash2, Save, Edit2, CheckSquare, ArrowUpDown, Wand2, ListChecks } from 'lucide-react';

// --- CONSTANTS & CONFIG ---
const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); 
const TAB_ALL = 'Tất cả Giảng viên';

// --- INITIAL MOCK DATA ---
const MOCK_CLASSES = [
  { id: 'C_MOCK_1', name: 'K13-KTCĐT', students: 19, major: 'Khoa Cơ khí - Cơ điện tử', instructor: 'Đoàn Vy Hiếu', description: 'DH_K13.45', isAssigned: false },
  { id: 'C_MOCK_2', name: 'K13-KTDK_TDH', students: 29, major: 'Khoa Điện - Điện tử', instructor: 'Đoàn Vy Hiếu', description: 'DH_K13.45', isAssigned: false }
];
const MOCK_ROOMS = [{ id: 'R_MOCK_1', name: 'A501', capacity: 100 }];
const MOCK_INSTRUCTORS = ['Chưa phân bổ', 'Đoàn Vy Hiếu'];

export default function App() {
  // --- STATE MANAGEMENT ---
  const [classes, setClasses] = useState(MOCK_CLASSES); 
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [instructors, setInstructors] = useState(MOCK_INSTRUCTORS);
  const [sessions, setSessions] = useState([]); 
  
  const [mainTab, setMainTab] = useState('VISUAL');
  const [activeInstructorTab, setActiveInstructorTab] = useState(TAB_ALL);
  
  const [history, setHistory] = useState([{ classes: MOCK_CLASSES, sessions: [], rooms: MOCK_ROOMS, instructors: MOCK_INSTRUCTORS }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [pasteData, setPasteData] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [roomFilter, setRoomFilter] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  
  const [formData, setFormData] = useState({ roomName: '', instructor: '', duration: 1, selectedClassIds: [] });

  const [newClassData, setNewClassData] = useState({ name: '', students: '', major: '', instructor: '', description: '' });
  const [newRoomData, setNewRoomData] = useState({ name: '', capacity: '' });
  const [newInstructorName, setNewInstructorName] = useState('');

  // Bulk Select, Inline Edit & Sort State
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Auto-Schedule State
  const [sidebarSelection, setSidebarSelection] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Reset states when changing tabs
  useEffect(() => {
    setSelectedRows([]);
    setEditingId(null);
    setSortConfig({ key: null, direction: 'ascending' });
    setSidebarSelection([]);
    setIsMultiSelectMode(false);
  }, [mainTab]);

  // --- UNDO/REDO LOGIC ---
  const saveState = useCallback((newClasses, newSessions, newRooms, newInstructors) => {
    const newState = { 
      classes: newClasses || classes, 
      sessions: newSessions || sessions,
      rooms: newRooms || rooms,
      instructors: newInstructors || instructors
    };
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newState]);
    setHistoryIndex(newHistory.length);
    if(newClasses) setClasses(newClasses);
    if(newSessions) setSessions(newSessions);
    if(newRooms) setRooms(newRooms);
    if(newInstructors) setInstructors(newInstructors);
  }, [history, historyIndex, classes, sessions, rooms, instructors]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      const state = history[prev];
      setClasses(state.classes); setSessions(state.sessions); setRooms(state.rooms || []); setInstructors(state.instructors || []);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      const state = history[next];
      setClasses(state.classes); setSessions(state.sessions); setRooms(state.rooms || []); setInstructors(state.instructors || []);
    }
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsImportModalOpen(false);
        setActiveModal(null);
        setEditingId(null); 
      }
      if (e.key === 'Enter' && e.ctrlKey && isImportModalOpen) {
        e.preventDefault();
        processImport();
      }
      if (e.key === 'Enter' && activeModal?.type === 'create_session') {
        e.preventDefault();
        saveSession();
      }
      if (e.key === 'Enter' && editingId !== null) {
        saveInlineEdit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImportModalOpen, activeModal, formData, mainTab, pasteData, editingId, editFormData]);

  // --- SORTING LOGIC ---
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const applySort = (dataArray) => {
    if (!sortConfig.key) return dataArray;
    return [...dataArray].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (!isNaN(valA) && !isNaN(valB)) {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  };

  // --- DATA IMPORT LOGIC ---
  const processImport = () => {
    if (!pasteData.trim()) return;
    const rows = pasteData.trim().split('\n');
    
    if (mainTab === 'DATA_CLASS') {
      const newClasses = [];
      rows.forEach((row, idx) => {
        const cols = row.split('\t');
        if (cols.length >= 2) {
          newClasses.push({
            id: `C${Date.now()}_${idx}`,
            name: cols[0]?.trim() || 'Lớp chưa đặt tên',
            students: parseInt(cols[1]?.trim()) || 0,
            major: cols[2]?.trim() || 'Chưa phân loại',
            instructor: cols[3]?.trim() || 'Chưa phân bổ',
            description: cols[4]?.trim() || '',
            isAssigned: false
          });
        }
      });
      if (newClasses.length > 0) saveState([...classes, ...newClasses], null, null, null);
    } 
    else if (mainTab === 'DATA_ROOM') {
      const newRooms = [];
      rows.forEach((row, idx) => {
        const cols = row.split('\t');
        if (cols[0]) newRooms.push({ id: `R${Date.now()}_${idx}`, name: cols[0].trim(), capacity: parseInt(cols[1]?.trim()) || 150 });
      });
      const currentRooms = rooms.filter(r => r.id !== 'R_DEFAULT');
      if (newRooms.length > 0) saveState(null, null, [...currentRooms, ...newRooms], null);
    }
    else if (mainTab === 'DATA_INSTRUCTOR') {
      const newInsts = rows.map(r => r.trim()).filter(r => r);
      if (newInsts.length > 0) {
        const uniqueInsts = [...new Set([...instructors, ...newInsts])];
        saveState(null, null, null, uniqueInsts);
      }
    }
    setPasteData(''); setIsImportModalOpen(false);
  };

  // --- CRUD & BULK ACTIONS ---
  const handleSelectRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleSelectAll = (ids, isChecked) => setSelectedRows(isChecked ? ids : []);

  const handleBulkDelete = (type) => {
    if(!window.confirm(`Hành động này sẽ xóa ${selectedRows.length} bản ghi. Chú ý: Dữ liệu liên quan sẽ bị loại bỏ đồng loạt. Xác nhận?`)) return;
    if(type === 'DATA_CLASS') {
      const updatedClasses = classes.filter(c => !selectedRows.includes(c.id));
      const updatedSessions = sessions.map(s => ({ ...s, classIds: s.classIds.filter(cid => !selectedRows.includes(cid)) })).filter(s => s.classIds.length > 0);
      saveState(updatedClasses, updatedSessions, null, null);
    } 
    else if(type === 'DATA_ROOM') saveState(null, null, rooms.filter(r => !selectedRows.includes(r.id)), null);
    else if(type === 'DATA_INSTRUCTOR') saveState(null, null, null, instructors.filter(i => !selectedRows.includes(i)));
    setSelectedRows([]);
  };

  const handleAddClassInline = () => {
    if (!newClassData.name.trim()) return;
    const newClass = { id: `C${Date.now()}`, name: newClassData.name.trim(), students: parseInt(newClassData.students) || 0, major: newClassData.major.trim() || 'Chưa phân loại', instructor: newClassData.instructor || instructors[0] || 'Chưa phân bổ', description: newClassData.description.trim() || '', isAssigned: false };
    saveState([...classes, newClass], null, null, null);
    setNewClassData({ name: '', students: '', major: '', instructor: '', description: '' });
  };
  const handleAddRoomInline = () => {
    if (!newRoomData.name.trim()) return;
    const newRoom = { id: `R${Date.now()}`, name: newRoomData.name.trim(), capacity: parseInt(newRoomData.capacity) || 150 };
    saveState(null, null, [...rooms.filter(r => r.id !== 'R_DEFAULT'), newRoom], null);
    setNewRoomData({ name: '', capacity: '' });
  };
  const handleAddInstructorInline = () => {
    if (!newInstructorName.trim()) return;
    const name = newInstructorName.trim();
    if (!instructors.includes(name)) saveState(null, null, null, [...instructors, name]);
    setNewInstructorName('');
  };

  const startInlineEdit = (type, item) => {
    setEditingId(item.id || item.name);
    setEditFormData(type === 'DATA_INSTRUCTOR' ? { oldName: item.name, newName: item.name } : {...item});
  };

  const saveInlineEdit = () => {
    if(mainTab === 'DATA_CLASS') {
      saveState(classes.map(c => c.id === editingId ? { ...c, ...editFormData, students: parseInt(editFormData.students)||0 } : c), null, null, null);
    } 
    else if (mainTab === 'DATA_ROOM') {
      const oldRoomName = rooms.find(r => r.id === editingId)?.name;
      saveState(null, sessions.map(s => s.roomName === oldRoomName ? { ...s, roomName: editFormData.name } : s), rooms.map(r => r.id === editingId ? { ...r, ...editFormData, capacity: parseInt(editFormData.capacity)||0 } : r), null);
    } 
    else if (mainTab === 'DATA_INSTRUCTOR') {
      if(!editFormData.newName.trim() || editFormData.newName === editFormData.oldName) { setEditingId(null); return; }
      saveState(classes.map(c => c.instructor === editFormData.oldName ? { ...c, instructor: editFormData.newName } : c), sessions.map(s => s.instructor === editFormData.oldName ? { ...s, instructor: editFormData.newName } : s), null, instructors.map(i => i === editFormData.oldName ? editFormData.newName : i));
    }
    setEditingId(null);
  };

  const deleteSingle = (type, id) => {
    if(!window.confirm('Xác nhận xóa bản ghi này?')) return;
    if(type === 'DATA_CLASS') saveState(classes.filter(c => c.id !== id), null, null, null);
    else if(type === 'DATA_ROOM') saveState(null, null, rooms.filter(r => r.id !== id), null);
    else if(type === 'DATA_INSTRUCTOR') saveState(null, null, null, instructors.filter(i => i !== id));
  };


  // --- DRAG AND DROP (DND) LOGIC ---
  const handleDragStartClass = (e, classId) => {
    e.dataTransfer.setData('type', 'CLASS');
    e.dataTransfer.setData('id', classId);
  };

  const handleDragStartSession = (e, sessionId) => {
    e.dataTransfer.setData('type', 'SESSION');
    e.dataTransfer.setData('id', sessionId);
  };

  const handleDropOnGrid = (e, dayIdx, hour) => {
    e.preventDefault();
    const dragType = e.dataTransfer.getData('type');
    const dragId = e.dataTransfer.getData('id');

    if (dragType === 'SESSION') {
      const sessionToMove = sessions.find(s => s.id === dragId);
      if (sessionToMove) {
        const updatedSessions = sessions.map(s => 
          s.id === dragId ? { ...s, dayIndex: dayIdx, startHour: hour } : s
        );
        saveState(null, updatedSessions, null, null);
      }
    } 
    else if (dragType === 'CLASS') {
      const classData = classes.find(c => c.id === dragId);
      if (classData) {
        const defaultInst = (activeInstructorTab !== TAB_ALL) ? activeInstructorTab : (classData.instructor !== 'Chưa phân bổ' ? classData.instructor : instructors[0] || '');
        const defaultRoom = rooms[0]?.name || '';
        
        setFormData({ 
          roomName: defaultRoom, 
          instructor: defaultInst, 
          duration: 1, 
          selectedClassIds: [dragId] 
        });
        setActiveModal({ type: 'create_session', dayIndex: dayIdx, hour: hour, existingSessionId: null });
      }
    }
  };

  // --- SESSION MODAL HANDLERS ---
  const openSessionModal = (dayIndex, hour, sessionId = null) => {
    if (sessionId) {
      const session = sessions.find(s => s.id === sessionId);
      setFormData({ roomName: session.roomName, instructor: session.instructor, duration: session.duration, selectedClassIds: [...session.classIds] });
      setActiveModal({ type: 'create_session', dayIndex, hour, existingSessionId: sessionId });
    } else {
      const defaultInst = (activeInstructorTab !== TAB_ALL) ? activeInstructorTab : (instructors[0] || '');
      const defaultRoom = rooms[0]?.name || '';
      setFormData({ roomName: defaultRoom, instructor: defaultInst, duration: 1, selectedClassIds: [] });
      setActiveModal({ type: 'create_session', dayIndex, hour, existingSessionId: null });
    }
  };

  const toggleClassSelection = (classId) => {
    setFormData(prev => ({ 
      ...prev, 
      selectedClassIds: prev.selectedClassIds.includes(classId) 
        ? prev.selectedClassIds.filter(id => id !== classId) 
        : [...prev.selectedClassIds, classId] 
    }));
  };

  const saveSession = () => {
    if (formData.selectedClassIds.length === 0) { alert("Hệ thống: Vui lòng chọn ít nhất 01 lớp."); return; }
    if (!formData.roomName) { alert("Hệ thống: Vui lòng chọn phòng họp."); return; }

    const currentStudents = formData.selectedClassIds.reduce((sum, id) => sum + (classes.find(c => c.id === id)?.students || 0), 0);
    const roomCapacity = rooms.find(r => r.name === formData.roomName)?.capacity || 150;

    if (currentStudents > roomCapacity) {
      alert(`Cảnh báo: Sức chứa phòng ${formData.roomName} là ${roomCapacity} SV. Khối lượng hiện tại: ${currentStudents} SV. Vui lòng điều chỉnh.`);
      return;
    }

    let updatedSessions = [...sessions];
    let updatedClasses = classes.map(c => ({...c}));

    if (activeModal.existingSessionId) {
      const oldSession = sessions.find(s => s.id === activeModal.existingSessionId);
      oldSession.classIds.forEach(id => { const c = updatedClasses.find(cls => cls.id === id); if (c) c.isAssigned = false; });
      updatedSessions = updatedSessions.filter(s => s.id !== activeModal.existingSessionId);
    }

    const newSession = {
      id: activeModal.existingSessionId || `S${Date.now()}`,
      dayIndex: activeModal.dayIndex, startHour: activeModal.hour, duration: 1,
      roomName: formData.roomName, instructor: formData.instructor,
      classIds: formData.selectedClassIds, totalStudents: currentStudents
    };

    updatedSessions.push(newSession);
    formData.selectedClassIds.forEach(id => { const c = updatedClasses.find(cls => cls.id === id); if (c) c.isAssigned = true; });

    saveState(updatedClasses, updatedSessions, null, null);
    setActiveModal(null);
  };

  const deleteSession = (sessionId) => {
    const sessionToRemove = sessions.find(s => s.id === sessionId);
    if (!sessionToRemove) return;
    saveState(classes.map(c => sessionToRemove.classIds.includes(c.id) ? { ...c, isAssigned: false } : c), sessions.filter(s => s.id !== sessionId), null, null);
    setActiveModal(null);
  };
  // --- AUTO-SCHEDULE ALGORITHM (BIN PACKING) ---
  const executeAutoSchedule = () => {
    if (sidebarSelection.length === 0) return;
    const classesToSchedule = classes.filter(c => sidebarSelection.includes(c.id));
    const sortedRooms = [...rooms].filter(r => r.id !== 'R_DEFAULT').sort((a, b) => b.capacity - a.capacity); 

    if (sortedRooms.length === 0) {
      alert("Lỗi Hệ thống: Không có dữ liệu Phòng họp thực tế để thực hiện phân bổ.");
      return;
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
            vs.classes.push(cls);
            vs.totalStudents += cls.students;
            placed = true;
            break;
          }
        }
        if (!placed) {
          virtualSessions.push({ classes: [cls], totalStudents: cls.students, instructor: inst });
        }
      });

      virtualSessions.forEach(vs => {
        const validRooms = sortedRooms.filter(r => r.capacity >= vs.totalStudents).sort((a, b) => a.capacity - b.capacity);
        if (validRooms.length === 0) {
          failedToSchedule.push(...vs.classes.map(c => c.name));
          return;
        }

        let scheduled = false;
        for (let d = 0; d < DAYS.length; d++) {
          for (let h of HOURS) {
            const instBusy = newSessions.some(s => s.dayIndex === d && s.startHour === h && s.instructor === vs.instructor);
            if (instBusy) continue;

            for (let room of validRooms) {
              const roomBusy = newSessions.some(s => s.dayIndex === d && s.startHour === h && s.roomName === room.name);
              if (!roomBusy) {
                const newSess = {
                  id: `S_AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  dayIndex: d, startHour: h, duration: 1,
                  roomName: room.name, instructor: vs.instructor,
                  classIds: vs.classes.map(c => c.id), totalStudents: vs.totalStudents
                };
                newSessions.push(newSess);
                vs.classes.forEach(c => {
                  const target = newClasses.find(nc => nc.id === c.id);
                  if (target) target.isAssigned = true;
                });
                scheduled = true;
                successCount += vs.classes.length;
                break;
              }
            }
            if (scheduled) break;
          }
          if (scheduled) break;
        }
        if (!scheduled) {
          failedToSchedule.push(...vs.classes.map(c => c.name));
        }
      });
    });

    saveState(newClasses, newSessions, null, null);
    setSidebarSelection([]); 
    setIsMultiSelectMode(false);
    
    if (failedToSchedule.length > 0) {
      alert(`Phân bổ thành công: ${successCount} lớp.\nThất bại: ${failedToSchedule.length} lớp (Nguyên nhân: Hết quỹ phòng trống hoặc Kẹt lịch giảng viên).\nLớp thất bại: ${failedToSchedule.join(', ')}`);
    }
  };

  // --- RENDER COMPONENT: VISUAL TAB ---
  const renderVisualTab = () => {
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
  };
  // --- RENDER COMPONENT: DATA TABS ---
  const renderDataTab = (type) => {
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
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-4 flex flex-col">
      <header className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 mb-4 flex justify-between items-center relative z-10 transition-shadow hover:shadow-md">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Bảng Điều Khiển Quản Trị Lịch Họp (Ver 3.5 - Kéo Thả & Sắp Xếp)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng số lớp: <span className="font-semibold text-blue-600">{classes.length}</span> | 
            Cơ sở vật chất: <span className="font-semibold text-amber-600">{rooms.length} phòng</span> |
            Đã xếp lịch: <span className="font-semibold text-green-600">{classes.filter(c=>c.isAssigned).length}/{classes.length} lớp</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleUndo} disabled={historyIndex === 0} className="p-2 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors" title="Hoàn tác (Undo)"><Undo2 size={18} /></button>
          <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="p-2 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors" title="Làm lại (Redo)"><Redo2 size={18} /></button>
        </div>
      </header>

      <div className="flex bg-white border border-slate-200 rounded-t-lg shadow-sm overflow-x-auto custom-scrollbar mb-0">
        <button onClick={() => setMainTab('VISUAL')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'VISUAL' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><Calendar size={16}/> Lịch Trực Quan</button>
        <button onClick={() => setMainTab('TABLE')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'TABLE' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><TableProperties size={16}/> Danh sách phân bổ</button>
        <div className="w-px h-6 bg-slate-300 mx-2 self-center"></div>
        <button onClick={() => setMainTab('DATA_CLASS')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'DATA_CLASS' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><Database size={16}/> Dữ liệu Lớp học</button>
        <button onClick={() => setMainTab('DATA_ROOM')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'DATA_ROOM' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><Settings2 size={16}/> Dữ liệu Phòng học</button>
        <button onClick={() => setMainTab('DATA_INSTRUCTOR')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'DATA_INSTRUCTOR' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><UserCircle size={16}/> Dữ liệu Giảng viên</button>
      </div>

      <div className="flex flex-1 overflow-hidden shadow-sm bg-white rounded-b-lg border-x border-b border-slate-200">
        {mainTab === 'VISUAL' && renderVisualTab()}
        {mainTab === 'TABLE' && (
           <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden p-4">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold text-slate-700">Bộ lọc nâng cao (Trạng thái phân bổ)</h2>
               <div className="relative">
                 <Filter size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
                 <input type="text" placeholder="Tra cứu tên lớp, giảng viên..." value={tableSearch} onChange={e => setTableSearch(e.target.value)} className="pl-8 pr-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 w-64" />
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
                       return { ...cls, roomName: session ? session.roomName : '', sessionText: session ? `${DAYS[session.dayIndex]}, ${session.startHour}:00` : '-' };
                     })
                   ).map(cls => (
                     <tr key={cls.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                       <td className="px-4 py-3 font-medium text-slate-800">{cls.name}</td><td className="px-4 py-3 text-slate-600">{cls.students}</td><td className="px-4 py-3 text-slate-600">{cls.instructor}</td>
                       <td className="px-4 py-3">{cls.isAssigned ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Đã xếp lịch</span> : <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">Chưa xếp lịch</span>}</td>
                       <td className="px-4 py-3 font-semibold text-blue-700">{cls.roomName || '-'}</td>
                       <td className="px-4 py-3 text-slate-600">{cls.sessionText}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}
        {(mainTab === 'DATA_CLASS' || mainTab === 'DATA_ROOM' || mainTab === 'DATA_INSTRUCTOR') && renderDataTab(mainTab)}
      </div>

      {/* --- MODALS --- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-[800px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-800">Cửa sổ Import Dữ Liệu Hàng Loạt</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>
            <div className="p-4 flex-1">
              <div className="mb-3 text-sm text-slate-700 bg-blue-50 border border-blue-100 p-3 rounded-md leading-relaxed">
                Yêu cầu hệ thống: Dữ liệu copy từ Excel phải tuân thủ chuẩn cấu trúc Tab-Separated. <br/>
                {mainTab === 'DATA_CLASS' && <span className="font-semibold text-blue-800">Cấu trúc 5 cột: Tên Lớp | Số lượng | Ngành | Giảng viên | Mô tả</span>}
                {mainTab === 'DATA_ROOM' && <span className="font-semibold text-blue-800">Cấu trúc 2 cột: Tên Phòng | Sức chứa tối đa (VD: P.201  150)</span>}
                {mainTab === 'DATA_INSTRUCTOR' && <span className="font-semibold text-blue-800">Cấu trúc 1 cột: Tên Giảng viên/QLLCN</span>}
              </div>
              <textarea className="w-full h-64 border border-slate-300 rounded p-3 text-sm font-mono focus:outline-none focus:border-blue-500 resize-none shadow-inner" placeholder="Dán (Paste) dữ liệu từ Excel vào đây..." value={pasteData} onChange={e => setPasteData(e.target.value)}></textarea>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <span className="text-xs text-slate-400 my-auto mr-auto hidden sm:block">Phím tắt: Esc (Thoát), Ctrl + Enter (Xác nhận)</span>
              <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-sm font-medium border rounded hover:bg-slate-50 transition-colors">Hủy</button>
              <button onClick={processImport} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2 transition-transform active:scale-95">
                <CheckCircle2 size={16}/> Lưu Hệ thống
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal?.type === 'create_session' && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-[850px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {activeModal.existingSessionId ? 'Hiệu chỉnh Lịch họp' : 'Khởi tạo Lịch họp mới'} 
                <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{DAYS[activeModal.dayIndex]} - {activeModal.hour}:00</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-4 flex-1 overflow-hidden flex gap-5">
              <div className="w-2/5 flex flex-col gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Phòng / Giảng đường (Dropdown)</label>
                    <select value={formData.roomName} onChange={e => setFormData({...formData, roomName: e.target.value})} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white">
                      <option value="" disabled>-- Chọn phòng trống --</option>
                      {rooms.map(r => <option key={r.id} value={r.name}>{r.name} (Sức chứa: {r.capacity})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Giảng viên / QLL (Dropdown)</label>
                    <select value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white">
                      <option value="" disabled>-- Chỉ định người đứng lớp --</option>
                      {instructors.map((inst, idx) => <option key={idx} value={inst}>{inst}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-inner mt-auto">
                  <div className="text-xs font-bold text-slate-600 mb-3 uppercase flex items-center gap-1"><Users size={14}/> Giám sát Sức chứa</div>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-slate-600">Đã đăng ký:</span>
                    <span className={`text-lg font-bold transition-colors duration-300 ${formData.selectedClassIds.reduce((sum, id) => sum + (classes.find(c=>c.id===id)?.students||0), 0) > (rooms.find(r=>r.name === formData.roomName)?.capacity || 150) ? 'text-red-600' : 'text-blue-700'}`}>
                      {formData.selectedClassIds.reduce((sum, id) => sum + (classes.find(c=>c.id===id)?.students||0), 0)} <span className="text-sm text-slate-400 font-normal"> / {rooms.find(r=>r.name === formData.roomName)?.capacity || 150} SV</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full transition-all duration-500 ease-out ${formData.selectedClassIds.reduce((sum, id) => sum + (classes.find(c=>c.id===id)?.students||0), 0) > (rooms.find(r=>r.name === formData.roomName)?.capacity || 150) ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (formData.selectedClassIds.reduce((sum, id) => sum + (classes.find(c=>c.id===id)?.students||0), 0) / (rooms.find(r=>r.name === formData.roomName)?.capacity || 150)) * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="w-3/5 border border-slate-200 rounded-lg flex flex-col overflow-hidden shadow-sm">
                <div className="p-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase flex justify-between items-center">
                  <span>Kho dữ liệu Lớp khả dụng</span><span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded normal-case font-medium">Đã chọn: {formData.selectedClassIds.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 grid grid-cols-2 gap-2.5 content-start bg-slate-50/50 custom-scrollbar">
                  {classes.filter(c => 
                      formData.selectedClassIds.includes(c.id) || 
                      (!c.isAssigned && (formData.instructor === '' || c.instructor === formData.instructor))
                    )
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(cls => {
                      const isSelected = formData.selectedClassIds.includes(cls.id);
                      return (
                        <div key={cls.id} onClick={() => toggleClassSelection(cls.id)} className={`p-2.5 border rounded-md cursor-pointer transition-all duration-200 text-sm flex flex-col relative group ${isSelected ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-md transform scale-[1.02] z-10' : 'bg-white border-slate-200 hover:border-slate-400'}`}>
                          <div className="font-bold text-slate-800 truncate pr-5" title={cls.name}>{cls.name}</div>
                          {cls.description && <Info size={14} className="absolute top-2.5 right-2 text-slate-400" title={`Mô tả: ${cls.description}`} />}
                          <div className="flex justify-between items-center mt-1.5 border-t border-slate-100 pt-1.5">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{cls.students} SV</span>
                            <span className="text-[10px] text-slate-500 truncate max-w-[80px]" title={cls.instructor}>{cls.instructor}</span>
                          </div>
                        </div>
                      )
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>{activeModal.existingSessionId && <button onClick={() => deleteSession(activeModal.existingSessionId)} className="text-sm font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded hover:bg-red-50 transition-colors border border-transparent">Xóa phân bổ</button>}</div>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-slate-400 mr-2 hidden sm:block">Phím tắt: Esc, Enter</span>
                <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-slate-50 shadow-sm transition-colors">Thoát</button>
                <button onClick={saveSession} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-transform active:scale-95"><CheckCircle2 size={16}/> Ghi nhận</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
