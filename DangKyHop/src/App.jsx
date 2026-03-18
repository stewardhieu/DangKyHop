import React, { useState } from 'react';
import DataImporter from './components/DataImporter';
import ScheduleCanvas from './components/ScheduleCanvas';
import AdvancedFilter from './components/AdvancedFilter';
import './styles.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('import');

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Hệ thống Quản lý Tối ưu Lịch họp</h2>
      
      <div style={{ borderBottom: '1px solid #ccc', marginBottom: '20px', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('import')} disabled={activeTab === 'import'}>1. Nhập liệu (Excel)</button>
        <button onClick={() => setActiveTab('schedule')} disabled={activeTab === 'schedule'} style={{ marginLeft: '10px' }}>2. Xếp lịch & Canvas</button>
      </div>

      {activeTab === 'import' && <DataImporter />}
      
      {activeTab === 'schedule' && (
        <div className="fade-in">
          <AdvancedFilter />
          <br />
          <ScheduleCanvas />
        </div>
      )}
    </div>
  );
}