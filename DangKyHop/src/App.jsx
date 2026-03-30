import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as CalendarIcon, Database, TableProperties, Settings2, UserCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { DAYS, PERIODS, TAB_ALL } from './constants/data';
import { startOfWeek, addWeeks, subWeeks, format, addDays, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';

import Header from './components/Header';
import VisualTab from './components/Tabs/VisualTab';
import TableTab from './components/Tabs/TableTab';
import DataTab from './components/Tabs/DataTab';
import ImportModal from './components/Modals/ImportModal';
import SessionModal from './components/Modals/SessionModal';
import AutoScheduleModal from './components/Modals/AutoScheduleModal';
import LoginModal from './components/Modals/LoginModal';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const { currentUser } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState('HK1');
  
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [history, setHistory] = useState([{ classes: [], sessions: [], rooms: [], instructors: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    let unsub = () => {};
    
    setIsDataLoaded(false);
    const initialEmptyState = { classes: [], sessions: [], rooms: [], instructors: [] };
    const docId = `main_${academicYear}_${semester}`;
    
    if (currentUser) {
      // Admin loads data once, then maintains local history for Undo/Redo
      getDoc(doc(db, 'appData', docId)).then(docSnap => {
        if (docSnap.exists()) {
          setHistory([docSnap.data()]);
          setHistoryIndex(0);
        } else {
          setHistory([initialEmptyState]);
          setHistoryIndex(0);
        }
        setIsDataLoaded(true);
      });
    } else {
      // Guest subscribes to real-time changes constantly
      unsub = onSnapshot(doc(db, 'appData', docId), (docSnap) => {
        if (docSnap.exists()) {
          setHistory([docSnap.data()]);
          setHistoryIndex(0);
        } else {
          setHistory([initialEmptyState]);
          setHistoryIndex(0);
        }
        setIsDataLoaded(true);
      });
    }

    return () => unsub();
  }, [currentUser, academicYear, semester]);

  const currentData = history[historyIndex] || history[0];
  const { classes, sessions, rooms, instructors } = currentData;

  const [mainTab, setMainTab] = useState('VISUAL');
  const [roomFilter, setRoomFilter] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [selectedTableRows, setSelectedTableRows] = useState([]);
  const [activeInstructorTab, setActiveInstructorTab] = useState(TAB_ALL);
  const [sidebarSelection, setSidebarSelection] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [pasteData, setPasteData] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // DATA TAB States
  const [newClassData, setNewClassData] = useState({ name: '', students: '', major: '', instructor: '', cohort: '' });
  const [newRoomData, setNewRoomData] = useState({ name: '', capacity: '' });
  const [lastSelectedDataId, setLastSelectedDataId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [newInstructorName, setNewInstructorName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // MODAL States
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({ roomName: '', instructor: '', selectedClassIds: [], isNewRoom: false, newRoomName: '', newRoomCapacity: 150 });

  const syncToFirebase = async (dataState) => {
    if (currentUser) {
      try {
        const docId = `main_${academicYear}_${semester}`;
        await setDoc(doc(db, 'appData', docId), dataState);
      } catch (err) {
        console.error("Lỗi đồng bộ Firebase:", err);
      }
    }
  };

  const saveState = useCallback((newClasses, newSessions, newRooms = rooms, newInstructors = instructors) => {
    const newState = { classes: newClasses, sessions: newSessions, rooms: newRooms, instructors: newInstructors };
    const newHistory = [...history.slice(0, historyIndex + 1), newState];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    syncToFirebase(newState);
  }, [history, historyIndex, rooms, instructors, currentUser]);

  const handleUndo = () => { 
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1); 
      syncToFirebase(history[historyIndex - 1]);
    }
  };
  const handleRedo = () => { 
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1); 
      syncToFirebase(history[historyIndex + 1]);
    }
  };

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

  const handleSelectRow = (id, e, filteredData) => {
    if (e && e.shiftKey && lastSelectedDataId && filteredData) {
      const currentIndex = filteredData.findIndex(c => c.id === id);
      const lastIndex = filteredData.findIndex(c => c.id === lastSelectedDataId);
      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        const rangeIds = filteredData.slice(start, end + 1).map(c => c.id);
        setSelectedRows(prev => [...new Set([...prev, ...rangeIds])]);
        return;
      }
    }
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    setLastSelectedDataId(id);
  };
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
      const updatedClasses = [...classes];
      lines.forEach(cols => {
        if (cols.length < 2) return;
        const name = cols[0];
        const students = parseInt(cols[1]) || 0;
        const major = cols[2] || '';
        const instructor = cols[3] || '';
        const cohort = cols[4] || '';
        
        const idx = updatedClasses.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
        if (idx !== -1) {
          updatedClasses[idx] = { ...updatedClasses[idx], students: students || updatedClasses[idx].students, major: major || updatedClasses[idx].major, instructor: instructor || updatedClasses[idx].instructor, cohort: cohort || updatedClasses[idx].cohort };
        } else {
          updatedClasses.push({ id: `C_IMP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, name, students, major, instructor, cohort, isAssigned: false });
        }
      });
      saveState(updatedClasses, sessions);
    } else if (mainTab === 'DATA_ROOM') {
      const updatedRooms = [...rooms];
      lines.forEach(cols => {
        if (cols.length < 2) return;
        const name = cols[0];
        const capacity = parseInt(cols[1]) || 0;
        
        const idx = updatedRooms.findIndex(r => r.name.toLowerCase() === name.toLowerCase());
        if (idx !== -1) {
          updatedRooms[idx] = { ...updatedRooms[idx], capacity: capacity || updatedRooms[idx].capacity };
        } else {
          updatedRooms.push({ id: `R_IMP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, name, capacity });
        }
      });
      saveState(classes, sessions, updatedRooms);
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
  
  const handleDropOnGrid = (e, dayIndex, periodId) => {
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;
    const data = JSON.parse(dataStr);
    
    if (data.type === 'class') {
      const validIds = data.ids.filter(id => classes.some(c => c.id === id));
      if (validIds.length > 0) openSessionModal(dayIndex, periodId, null, validIds);
    } else if (data.type === 'session') {
      const targetSession = sessions.find(s => s.id === data.id);
      if (targetSession) saveState(classes, sessions.map(s => s.id === targetSession.id ? { ...s, dayIndex, periodId } : s));
    }
  };

  // --- MODAL LOGIC (CREATE & EDIT SESSION) ---
  const openSessionModal = (dayIndex = 0, periodId = 1, existingSessionId = null, initialClassIds = []) => {
    if (existingSessionId) {
      const session = sessions.find(s => s.id === existingSessionId);
      setFormData({ roomName: session.roomName, instructor: session.instructor, selectedClassIds: session.classIds, isNewRoom: false, newRoomName: '', newRoomCapacity: 150, dayIndex: session.dayIndex, periodId: session.periodId, date: session.date || format(addDays(currentWeekStart, session.dayIndex), 'yyyy-MM-dd') });
      setActiveModal({ type: 'create_session', dayIndex, periodId: periodId, existingSessionId });
    } else {
      setFormData({ roomName: '', instructor: '', selectedClassIds: initialClassIds, isNewRoom: false, newRoomName: '', newRoomCapacity: 150, dayIndex: dayIndex ?? 0, periodId: periodId ?? 1, date: format(addDays(currentWeekStart, dayIndex ?? 0), 'yyyy-MM-dd') });
      setActiveModal({ type: 'create_session', dayIndex, periodId: periodId, existingSessionId: null });
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
      newSessions = newSessions.map(s => s.id === activeModal.existingSessionId ? { ...s, roomName: finalRoomName, instructor: formData.instructor, classIds: formData.selectedClassIds, totalStudents: currentStudents, dayIndex: formData.dayIndex, periodId: formData.periodId, date: formData.date } : s);
    } else {
      newSessions.push({ id: `S_${Date.now()}`, dayIndex: formData.dayIndex, periodId: formData.periodId, date: formData.date, duration: 1, roomName: finalRoomName, instructor: formData.instructor, classIds: formData.selectedClassIds, totalStudents: currentStudents });
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

  const updateClassSessionInline = (classId, action, roomName, dayIndex, periodId) => {
    if (!currentUser) return;
    
    if (action === 'UNASSIGNED') {
      const newSessions = sessions.map(s => {
        if (s.classIds.includes(classId)) {
          const removedClass = classes.find(c => c.id === classId);
          return {
            ...s,
            classIds: s.classIds.filter(id => id !== classId),
            totalStudents: s.totalStudents - (removedClass ? parseInt(removedClass.students || 0) : 0)
          };
        }
        return s;
      }).filter(s => s.classIds.length > 0);

      const newClasses = classes.map(c => c.id === classId ? { ...c, isAssigned: false } : c);
      saveState(newClasses, newSessions);
    } 
    else if (action === 'ASSIGNED') {
      openSessionModal(0, 1, null, [classId]);
    }
    else if (action === 'UPDATE') {
      const session = sessions.find(s => s.classIds.includes(classId));
      if (session) {
        const targetSession = sessions.find(s => s.dayIndex === dayIndex && s.periodId === periodId && s.roomName === roomName && s.id !== session.id);
        const classObj = classes.find(c => c.id === classId);
        const stCount = parseInt(classObj?.students || 0);
        
        let newSessions;
        if (targetSession) {
          newSessions = sessions.map(s => {
            if (s.id === session.id) {
               return { ...s, classIds: s.classIds.filter(id => id !== classId), totalStudents: s.totalStudents - stCount };
            }
            if (s.id === targetSession.id) {
               return { ...s, classIds: [...new Set([...s.classIds, classId])], totalStudents: s.totalStudents + stCount };
            }
            return s;
          }).filter(s => s.classIds.length > 0);
        } else {
          const newDate = format(addDays(currentWeekStart, dayIndex), 'yyyy-MM-dd');
          if (session.classIds.length > 1) {
             const newSession = { ...session, id: `S_${Date.now()}`, dayIndex, periodId, roomName, date: newDate, classIds: [classId], totalStudents: stCount };
             newSessions = sessions.map(s => s.id === session.id ? { ...s, classIds: s.classIds.filter(id=>id!==classId), totalStudents: s.totalStudents - stCount } : s);
             newSessions.push(newSession);
          } else {
            newSessions = sessions.map(s => s.id === session.id ? { ...s, dayIndex, periodId, roomName, date: newDate } : s);
          }
        }
        saveState(classes, newSessions);
      }
    }
  };

  const handleBulkTableAction = (action) => {
    if (!currentUser || selectedTableRows.length === 0) return;
    if (action === 'UNASSIGNED') {
      if(!window.confirm(`Hủy phân bổ cho ${selectedTableRows.length} lớp đã chọn?`)) return;
      
      const newSessions = sessions.map(s => {
        const remainingIds = s.classIds.filter(id => !selectedTableRows.includes(id));
        const removedIds = s.classIds.filter(id => selectedTableRows.includes(id));
        const removedStudents = removedIds.reduce((sum, id) => sum + parseInt(classes.find(c=>c.id===id)?.students || 0), 0);
        return { ...s, classIds: remainingIds, totalStudents: s.totalStudents - removedStudents };
      }).filter(s => s.classIds.length > 0);

      const newClasses = classes.map(c => selectedTableRows.includes(c.id) ? { ...c, isAssigned: false } : c);
      saveState(newClasses, newSessions);
      setSelectedTableRows([]);
    }
  };

  // --- AUTO-SCHEDULE ALGORITHM (BIN PACKING) ---
  const executeAutoSchedule = (config) => {
    const { allowedDays, allowedPeriods, maxClassesPerSession, startDate, endDate } = config;

    if (sidebarSelection.length === 0) return;
    const classesToSchedule = classes.filter(c => sidebarSelection.includes(c.id));
    const sortedRooms = [...rooms].filter(r => r.id !== 'R_DEFAULT').sort((a, b) => b.capacity - a.capacity); 

    if (sortedRooms.length === 0) {
      alert("Lỗi Hệ thống: Không có dữ liệu Phòng họp thực tế để thực hiện phân bổ."); return;
    }

    // Generate target dates from range
    const targetDates = [];
    if (startDate && endDate) {
      let curr = new Date(startDate);
      const endObj = new Date(endDate);
      while (curr <= endObj) {
        const dayIdx = (getDay(curr) + 6) % 7; 
        if (allowedDays.includes(dayIdx)) {
          targetDates.push({ dateStr: format(curr, 'yyyy-MM-dd'), dayIndex: dayIdx });
        }
        curr = addDays(curr, 1);
      }
    }

    if (targetDates.length === 0) {
      alert("Không tìm thấy ngày nào hợp lệ trong khoảng thời gian đã chọn!"); return;
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
            const matchMajor = !config.mergeByMajor || vs.classes.every(vc => vc.major === cls.major);
            const matchCohort = !config.mergeByCohort || vs.classes.every(vc => vc.cohort === cls.cohort);
            
            if (matchMajor && matchCohort) {
              if (maxClassesPerSession === 0 || vs.classes.length < maxClassesPerSession) {
                vs.classes.push(cls); vs.totalStudents += cls.students; placed = true; break;
              }
            }
          }
        }
        if (!placed) virtualSessions.push({ classes: [cls], totalStudents: cls.students, instructor: inst });
      });

      virtualSessions.forEach(vs => {
        const validRooms = sortedRooms.filter(r => r.capacity >= vs.totalStudents).sort((a, b) => a.capacity - b.capacity);
        if (validRooms.length === 0) { failedToSchedule.push(...vs.classes.map(c => c.name)); return; }

        let scheduled = false;
        for (let target of targetDates) {
          const { dateStr, dayIndex } = target;
          for (let pId of allowedPeriods) {
            const instBusy = newSessions.some(s => s.date === dateStr && s.periodId === pId && s.instructor === vs.instructor);
            if (instBusy) continue;

            for (let room of validRooms) {
              const roomBusy = newSessions.some(s => s.date === dateStr && s.periodId === pId && s.roomName === room.name);
              if (!roomBusy) {
                newSessions.push({ id: `S_AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, dayIndex, periodId: pId, date: dateStr, duration: 1, roomName: room.name, instructor: vs.instructor, classIds: vs.classes.map(c => c.id), totalStudents: vs.totalStudents });
                vs.classes.forEach(c => { const nc = newClasses.find(n => n.id === c.id); if (nc) nc.isAssigned = true; });
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

  if (!isDataLoaded) {
    return (
      <div className="h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-blue-600 font-medium animate-pulse flex items-center gap-2">
           Đang tải dữ liệu từ máy chủ...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 text-slate-900 font-sans p-4 flex flex-col overflow-hidden">
      <Header classes={classes} rooms={rooms} historyIndex={historyIndex} historyLength={history.length} handleUndo={handleUndo} handleRedo={handleRedo} onOpenLogin={() => setIsLoginModalOpen(true)} mainTab={mainTab} setIsExporting={setIsExporting} academicYear={academicYear} setAcademicYear={setAcademicYear} semester={semester} setSemester={setSemester} />

      <div className="flex bg-white border border-slate-200 rounded-t-lg shadow-sm overflow-x-auto custom-scrollbar mb-0 items-center justify-between">
        <div className="flex">
          <button onClick={() => setMainTab('VISUAL')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'VISUAL' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><CalendarIcon size={16}/> Lịch Trực Quan</button>
          <button onClick={() => setMainTab('TABLE')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'TABLE' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><TableProperties size={16}/> Danh sách phân bổ</button>
          <div className="w-px h-6 bg-slate-300 mx-2 self-center"></div>
          <button onClick={() => setMainTab('DATA_CLASS')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'DATA_CLASS' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><Database size={16}/> Dữ liệu Lớp học</button>
          <button onClick={() => setMainTab('DATA_ROOM')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'DATA_ROOM' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><Settings2 size={16}/> Dữ liệu Phòng học</button>
          <button onClick={() => setMainTab('DATA_INSTRUCTOR')} className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${mainTab === 'DATA_INSTRUCTOR' ? 'border-blue-600 text-blue-700 bg-blue-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}><UserCircle size={16}/> Dữ liệu Giảng viên</button>
        </div>
        
        {mainTab === 'VISUAL' && (
          <div className="flex items-center gap-3 px-4 border-l border-slate-300">
            <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-slate-700 tracking-wide min-w-[200px] text-center">
                Tuần bắt đầu: {format(currentWeekStart, 'dd/MM/yyyy')}
              </span>
              <input 
                type="date" 
                onChange={(e) => {
                  if (e.target.value) {
                    const selectedDate = new Date(e.target.value);
                    // startOfWeek from date-fns
                    import('date-fns').then(({ startOfWeek }) => {
                       setCurrentWeekStart(startOfWeek(selectedDate, { weekStartsOn: 1 }));
                    });
                  }
                }}
                className="text-xs border border-slate-200 rounded px-1 py-0.5 mt-1 focus:outline-none focus:border-blue-500 text-slate-600 cursor-pointer shadow-sm"
              />
            </div>
            <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden shadow-sm bg-white rounded-b-lg border-x border-b border-slate-200">
        {mainTab === 'VISUAL' && <VisualTab currentWeekStart={currentWeekStart} classes={classes} sessions={sessions} instructors={instructors} activeInstructorTab={activeInstructorTab} setActiveInstructorTab={setActiveInstructorTab} roomFilter={roomFilter} setRoomFilter={setRoomFilter} sidebarSelection={sidebarSelection} setSidebarSelection={setSidebarSelection} isMultiSelectMode={isMultiSelectMode} setIsMultiSelectMode={setIsMultiSelectMode} handleDragStartClass={handleDragStartClass} handleDragStartSession={handleDragStartSession} handleDropOnGrid={handleDropOnGrid} executeAutoSchedule={executeAutoSchedule} openSessionModal={openSessionModal} sidebarSearch={sidebarSearch} setSidebarSearch={setSidebarSearch} setActiveModal={setActiveModal} />}
        {mainTab === 'TABLE' && <TableTab classes={classes} sessions={sessions} tableSearch={tableSearch} setTableSearch={setTableSearch} sortConfig={sortConfig} requestSort={requestSort} applySort={applySort} rooms={rooms} updateClassSessionInline={updateClassSessionInline} selectedTableRows={selectedTableRows} setSelectedTableRows={setSelectedTableRows} handleBulkTableAction={handleBulkTableAction} />}
        {(mainTab === 'DATA_CLASS' || mainTab === 'DATA_ROOM' || mainTab === 'DATA_INSTRUCTOR') && <DataTab type={mainTab} classes={classes} rooms={rooms} instructors={instructors} sessions={sessions} selectedRows={selectedRows} editingId={editingId} editFormData={editFormData} sortConfig={sortConfig} requestSort={requestSort} applySort={applySort} handleSelectRow={handleSelectRow} handleSelectAll={handleSelectAll} handleBulkDelete={handleBulkDelete} newClassData={newClassData} setNewClassData={setNewClassData} handleAddClassInline={handleAddClassInline} newRoomData={newRoomData} setNewRoomData={setNewRoomData} handleAddRoomInline={handleAddRoomInline} newInstructorName={newInstructorName} setNewInstructorName={setNewInstructorName} handleAddInstructorInline={handleAddInstructorInline} setEditFormData={setEditFormData} saveInlineEdit={saveInlineEdit} setEditingId={setEditingId} startInlineEdit={startInlineEdit} deleteSingle={deleteSingle} setIsImportModalOpen={setIsImportModalOpen} />}
      </div>

      <ImportModal isImportModalOpen={isImportModalOpen} setIsImportModalOpen={setIsImportModalOpen} mainTab={mainTab} pasteData={pasteData} setPasteData={setPasteData} processImport={processImport} />
      <SessionModal activeModal={activeModal} setActiveModal={setActiveModal} formData={formData} setFormData={setFormData} rooms={rooms} instructors={instructors} classes={classes} sessions={sessions} deleteSession={deleteSession} saveSession={saveSession} toggleClassSelection={toggleClassSelection} />
      <AutoScheduleModal activeModal={activeModal} setActiveModal={setActiveModal} executeAutoSchedule={executeAutoSchedule} sidebarSelectionCount={sidebarSelection.length} currentWeekStart={currentWeekStart} />
      
      {isExporting && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center text-white animate-in fade-in">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-sm mx-auto border border-slate-200 animate-in zoom-in-95">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-3"></div>
            <div className="font-bold text-base text-slate-800">Đang khởi tạo tệp báo cáo...</div>
            <p className="text-xs text-slate-500 mt-1 text-center font-normal">Hệ thống đang quét hàng cho khung A4. Vui lòng giữ cửa sổ trình duyệt bật.</p>
          </div>
        </div>
      )}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
