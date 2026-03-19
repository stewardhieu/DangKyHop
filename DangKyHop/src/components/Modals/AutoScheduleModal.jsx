import React, { useState } from 'react';
import { X, Wand2 } from 'lucide-react';
import { DAYS, PERIODS } from '../../constants/data';
import { format, addDays } from 'date-fns';

export default function AutoScheduleModal({ activeModal, setActiveModal, executeAutoSchedule, sidebarSelectionCount, currentWeekStart }) {
  if (activeModal?.type !== 'auto_schedule') return null;

  const [config, setConfig] = useState({
    allowedDays: [0, 1, 2, 3, 4, 5, 6],
    allowedPeriods: PERIODS.map(p=>p.id),
    maxClassesPerSession: 0,
    startDate: currentWeekStart ? format(currentWeekStart, 'yyyy-MM-dd') : '',
    endDate: currentWeekStart ? format(addDays(currentWeekStart, 6), 'yyyy-MM-dd') : ''
  });

  const toggleDay = (dayIdx) => {
    setConfig(prev => ({
      ...prev,
      allowedDays: prev.allowedDays.includes(dayIdx) ? prev.allowedDays.filter(d => d !== dayIdx) : [...prev.allowedDays, dayIdx].sort()
    }));
  };

  const togglePeriod = (pId) => {
    setConfig(prev => ({
      ...prev,
      allowedPeriods: prev.allowedPeriods.includes(pId) ? prev.allowedPeriods.filter(h => h !== pId) : [...prev.allowedPeriods, pId].sort((a, b) => a - b)
    }));
  };

  const handleRun = () => {
    if (config.allowedDays.length === 0 || config.allowedPeriods.length === 0) {
      alert("Vui lòng chọn khung thời gian (ngày, tiết) cho phép!"); return;
    }
    if (!config.startDate || !config.endDate) {
      alert("Vui lòng nhập khoảng Ngày phân bổ (Từ ngày - Đến ngày)!"); return;
    }
    executeAutoSchedule(config);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[500px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Wand2 className="text-blue-600" size={20} /> Cấu hình Phân bổ Nâng cao
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 border border-transparent hover:bg-slate-200 transition-colors p-1 rounded-md"><X size={20}/></button>
        </div>
        
        <div className="p-5 space-y-6 flex-1">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800 flex gap-3 text-justify items-start">
            <div>Đang chuẩn bị phân bổ tự động cho <span className="font-bold text-lg text-blue-900">{sidebarSelectionCount}</span> lớp học. Thuật toán sẽ tối ưu hóa phòng học tránh lãng phí diện tích, dựa theo các thuộc tính ràng buộc dưới đây:</div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide text-xs">Khoảng thời gian phân bổ (Từ - Đến)</label>
              <div className="flex gap-2">
                <input type="date" value={config.startDate} onChange={(e) => setConfig({...config, startDate: e.target.value})} className="w-1/2 border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer shadow-sm" />
                <input type="date" value={config.endDate} onChange={(e) => setConfig({...config, endDate: e.target.value})} className="w-1/2 border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer shadow-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide text-xs">Khung ngày trong tuần cho phép</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day, idx) => (
                  <button 
                    key={idx} onClick={() => toggleDay(idx)}
                    className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${config.allowedDays.includes(idx) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide text-xs">Số lượng lớp gộp tối đa</label>
              <div className="flex items-center gap-3">
                <input type="number" min="0" value={config.maxClassesPerSession} onChange={(e) => setConfig({...config, maxClassesPerSession: parseInt(e.target.value) || 0})} className="w-24 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-center" />
                <span className="text-xs text-slate-500 flex-1">Nhập <span className="font-bold">0</span> nếu không muốn giới hạn.</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide text-xs">Ràng buộc gộp nâng cao</label>
              <div className="space-y-2 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                  <input type="checkbox" checked={config.mergeByMajor || false} onChange={(e) => setConfig({...config, mergeByMajor: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
                  <span>Chỉ gộp các lớp có <strong className="text-blue-700">Cùng Ngành học</strong></span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                  <input type="checkbox" checked={config.mergeByCohort || false} onChange={(e) => setConfig({...config, mergeByCohort: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
                  <span>Chỉ gộp các lớp có <strong className="text-blue-700">Cùng Khoá học</strong></span>
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide text-xs">Phạm vi Tiết học quy định</label>
                <div className="flex gap-2">
                  <button onClick={() => setConfig({...config, allowedPeriods: PERIODS.map(p=>p.id)})} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-semibold transition-colors">Chọn tất cả</button>
                  <button onClick={() => setConfig({...config, allowedPeriods: []})} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-semibold transition-colors">Bỏ chọn</button>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {PERIODS.map(period => (
                  <button 
                    key={period.id} onClick={() => togglePeriod(period.id)}
                    className={`px-2 py-1 rounded border text-[11px] font-bold transition-all ${config.allowedPeriods.includes(period.id) ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}
                  >
                    {period.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
          <button onClick={() => setActiveModal(null)} className="px-5 py-2 text-sm font-medium border rounded-md hover:bg-white bg-slate-100 shadow-sm transition-colors text-slate-700">Hủy</button>
          <button onClick={handleRun} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 border border-blue-700 rounded-md hover:bg-blue-700 active:scale-95 flex items-center gap-2 shadow-sm transition-transform"><Wand2 size={16}/> Thực thi thuât toán</button>
        </div>
      </div>
    </div>
  );
}
