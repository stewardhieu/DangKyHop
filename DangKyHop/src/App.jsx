// src/App.jsx

import React, { useCallback, useMemo, useState } from 'react';
import {
  TableProperties,
  UserCircle,
} from 'lucide-react';

import { MOCK_CLASSES, MOCK_INSTRUCTORS, MOCK_ROOMS, TAB_ALL } from './constants/data';
import Header from './components/Header';
import VisualTab from './components/Tabs/VisualTab';
import TableTab from './components/Tabs/TableTab';
import DataTab from './components/Tabs/DataTab';
import ImportModal from './components/Modals/ImportModal';
import SessionModal from './components/Modals/SessionModal';

const MAIN_TABS = {
  VISUAL: 'VISUAL',
  DATA_CLASS: 'DATA_CLASS',
  DATA_ROOM: 'DATA_ROOM',
  DATA_INSTRUCTOR: 'DATA_INSTRUCTOR',
  TABLE: 'TABLE',
};

export default function App() {
  // ------- 1. STATE MANAGEMENT -------
  const [classes, setClasses] = useState(MOCK_CLASSES);
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [instructors, setInstructors] = useState(MOCK_INSTRUCTORS);

  const [mainTab, setMainTab] = useState(MAIN_TABS.VISUAL);
  const [activeInstructorTab, setActiveInstructorTab] = useState(TAB_ALL);
  const [roomFilter, setRoomFilter] = useState('');
  const [sidebarSelection, setSidebarSelection] = useState(null);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // ------- 2. LOGIC FUNCTIONS -------
  const saveState = useCallback(
    (nextState) => {
      setHistory((prev) => [...prev, { classes, sessions, rooms, instructors }]);
      setFuture([]);
      if (typeof nextState === 'function') {
        nextState();
      }
    },
    [classes, sessions, rooms, instructors]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture((prev) => [{ classes, sessions, rooms, instructors }, ...prev]);
    setHistory((prev) => prev.slice(0, -1));
    setClasses(previous.classes);
    setSessions(previous.sessions);
    setRooms(previous.rooms);
    setInstructors(previous.instructors);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((prev) => [...prev, { classes, sessions, rooms, instructors }]);
    setFuture((prev) => prev.slice(1));
    setClasses(next.classes);
    setSessions(next.sessions);
    setRooms(next.rooms);
    setInstructors(next.instructors);
  };

  const executeAutoSchedule = () => {
    // Placeholder implementation: clone classes to sessions in order.
    saveState(() => {
      const generated = classes
        .filter((c) => !c.isAssigned)
        .map((c, index) => ({
          id: `SCHED_${c.id}_${index}`,
          classId: c.id,
          className: c.name,
          instructor: c.instructor,
          room: rooms[0]?.name ?? 'Chưa có phòng',
          time: `${index + 8}:00`,
        }));
      setSessions(generated);
      setClasses((prev) => prev.map((c) => ({ ...c, isAssigned: true })));
    });
  };

  const handleDragStartClass = (event, clazz) => {
    event.dataTransfer.setData('application/json', JSON.stringify({ type: 'CLASS', payload: clazz }));
  };

  const handleDragStartSession = (event, session) => {
    event.dataTransfer.setData('application/json', JSON.stringify({ type: 'SESSION', payload: session }));
  };

  const handleDropOnGrid = (event) => {
    event.preventDefault();

    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      if (data.type === 'CLASS') {
        const clazz = data.payload;
        // Simple example: mark as assigned and add a minimum session entry.
        saveState(() => {
          setClasses((prev) =>
            prev.map((c) => (c.id === clazz.id ? { ...c, isAssigned: true } : c))
          );
          setSessions((prev) => [
            ...prev,
            {
              id: `session_${clazz.id}_${Date.now()}`,
              classId: clazz.id,
              className: clazz.name,
              instructor: clazz.instructor,
              room: rooms[0]?.name ?? 'Chưa có phòng',
              time: '08:00',
            },
          ]);
        });
      }
    } catch (error) {
      // ignored
    }
  };

  const openSessionModal = () => setIsSessionModalOpen(true);

  const handleSessionCreate = (sessionData) => {
    setIsSessionModalOpen(false);
    if (!sessionData?.name) return;
    saveState(() => {
      setSessions((prev) => [
        ...prev,
        {
          id: `session_${Date.now()}`,
          classId: null,
          className: sessionData.name,
          instructor: '',
          room: '',
          time: sessionData.date,
        },
      ]);
    });
  };

  const handleImport = (file) => {
    setIsImportModalOpen(false);
    // Placeholder: in a real app, parse the file and update state.
    console.info('Import file', file);
  };

  const filteredSessions = useMemo(() => {
    if (!roomFilter) return sessions;
    return sessions.filter((s) => s.room.toLowerCase().includes(roomFilter.toLowerCase()));
  }, [roomFilter, sessions]);

  // ------- 3. RENDER -------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-4 flex flex-col">
      <Header
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenSettings={() => setMainTab(MAIN_TABS.DATA_ROOM)}
      />

      <div className="flex bg-white border border-slate-200 rounded-t-lg shadow-sm overflow-x-auto custom-scrollbar mb-0">
        <button
          type="button"
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            mainTab === MAIN_TABS.VISUAL ? 'bg-slate-100' : 'hover:bg-slate-50'
          }`}
          onClick={() => setMainTab(MAIN_TABS.VISUAL)}
        >
          Lịch Trực Quan
        </button>
        <button
          type="button"
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            mainTab === MAIN_TABS.TABLE ? 'bg-slate-100' : 'hover:bg-slate-50'
          }`}
          onClick={() => setMainTab(MAIN_TABS.TABLE)}
        >
          Bảng Phân Bổ
        </button>
        <button
          type="button"
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            mainTab === MAIN_TABS.DATA_CLASS ? 'bg-slate-100' : 'hover:bg-slate-50'
          }`}
          onClick={() => setMainTab(MAIN_TABS.DATA_CLASS)}
        >
          Dữ liệu Lớp
        </button>
        <button
          type="button"
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            mainTab === MAIN_TABS.DATA_ROOM ? 'bg-slate-100' : 'hover:bg-slate-50'
          }`}
          onClick={() => setMainTab(MAIN_TABS.DATA_ROOM)}
        >
          Dữ liệu Phòng
        </button>
        <button
          type="button"
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            mainTab === MAIN_TABS.DATA_INSTRUCTOR ? 'bg-slate-100' : 'hover:bg-slate-50'
          }`}
          onClick={() => setMainTab(MAIN_TABS.DATA_INSTRUCTOR)}
        >
          Dữ liệu Giảng viên
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden shadow-sm bg-white rounded-b-lg border-x border-b border-slate-200">
        {mainTab === MAIN_TABS.VISUAL && (
          <VisualTab
            classes={classes}
            sessions={filteredSessions}
            rooms={rooms}
            instructors={instructors}
            activeInstructorTab={activeInstructorTab}
            setActiveInstructorTab={setActiveInstructorTab}
            roomFilter={roomFilter}
            setRoomFilter={setRoomFilter}
            sidebarSelection={sidebarSelection}
            setSidebarSelection={setSidebarSelection}
            isMultiSelectMode={isMultiSelectMode}
            setIsMultiSelectMode={setIsMultiSelectMode}
            handleDragStartClass={handleDragStartClass}
            handleDragStartSession={handleDragStartSession}
            handleDropOnGrid={handleDropOnGrid}
            openSessionModal={openSessionModal}
            executeAutoSchedule={executeAutoSchedule}
          />
        )}

        {mainTab === MAIN_TABS.TABLE && (
          <TableTab
            allocations={filteredSessions}
            onRemoveAllocation={(item) => {
              saveState(() => {
                setSessions((prev) => prev.filter((s) => s.id !== item.id));
              });
            }}
            onEditAllocation={(item) => {
              // Placeholder: open modal or inline edit
              console.info('Edit allocation', item);
            }}
          />
        )}

        {mainTab === MAIN_TABS.DATA_CLASS && (
          <DataTab
            type="DATA_CLASS"
            data={classes}
            onUpdateItem={(item) => console.info('Edit class', item)}
            onDeleteItem={(item) => {
              saveState(() => {
                setClasses((prev) => prev.filter((c) => c.id !== item.id));
              });
            }}
          />
        )}

        {mainTab === MAIN_TABS.DATA_ROOM && (
          <DataTab
            type="DATA_ROOM"
            data={rooms}
            onUpdateItem={(item) => console.info('Edit room', item)}
            onDeleteItem={(item) => {
              saveState(() => {
                setRooms((prev) => prev.filter((r) => r.id !== item.id));
              });
            }}
          />
        )}

        {mainTab === MAIN_TABS.DATA_INSTRUCTOR && (
          <DataTab
            type="DATA_INSTRUCTOR"
            data={instructors}
            onUpdateItem={(item) => console.info('Edit instructor', item)}
            onDeleteItem={(item) => {
              saveState(() => {
                setInstructors((prev) => prev.filter((i) => i !== item));
              });
            }}
          />
        )}
      </div>

      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImport} />
      <SessionModal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} onSave={handleSessionCreate} />
    </div>
  );
}
