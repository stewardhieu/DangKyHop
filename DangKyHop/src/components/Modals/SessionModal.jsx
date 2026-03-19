import React from 'react';
import { X, Users, Info, CheckCircle2 } from 'lucide-react';
import { DAYS, PERIODS } from '../../constants/data';

export default function SessionModal({
  activeModal,
  setActiveModal,
  formData,
  setFormData,
  rooms,
  instructors,
  classes,
  sessions,
  deleteSession,
  saveSession,
  toggleClassSelection
}) {
  if (activeModal?.type !== 'create_session') return null;

  const currentStudents = formData.selectedClassIds.reduce((sum, id) => sum + (classes.find(c=>c.id===id)?.students||0), 0);
  const roomCapacity = formData.isNewRoom ? (parseInt(formData.newRoomCapacity) || 150) : (rooms.find(r=>r.name === formData.roomName)?.capacity || 150);
  const percentage = Math.min(100, (currentStudents / roomCapacity) * 100);
  const isOverCapacity = currentStudents > roomCapacity;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[850px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {activeModal.existingSessionId ? 'Hiệu chỉnh Lịch họp' : 'Khởi tạo Lịch họp mới'} 
            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{DAYS[activeModal.dayIndex]} - {PERIODS.find(p=>p.id===activeModal.periodId)?.name}</span>
          </h3>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
        </div>
        
        <div className="p-4 flex-1 overflow-hidden flex gap-5">
          <div className="w-2/5 flex flex-col gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Phòng / Giảng đường (Dropdown)</label>
                {!formData.isNewRoom ? (
                  <select value={formData.roomName} onChange={e => {
                    if (e.target.value === 'NEW_ROOM') setFormData({...formData, isNewRoom: true, roomName: ''});
                    else setFormData({...formData, roomName: e.target.value});
                  }} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white">
                    <option value="" disabled>-- Chọn phòng trống --</option>
                    {rooms.map(r => <option key={r.id} value={r.name}>{r.name} (Sức chứa: {r.capacity})</option>)}
                    <option value="NEW_ROOM" className="font-bold text-blue-600">+ Thêm phòng trực tiếp...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Tên P.Họp mới" value={formData.newRoomName} onChange={e => setFormData({...formData, newRoomName: e.target.value})} className="w-2/3 border border-blue-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm bg-blue-50" autoFocus />
                    <input type="number" placeholder="Sức chứa" value={formData.newRoomCapacity} onChange={e => setFormData({...formData, newRoomCapacity: e.target.value})} className="w-1/3 border border-blue-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm bg-blue-50" />
                    <button onClick={() => setFormData({...formData, isNewRoom: false, newRoomName: '', newRoomCapacity: 150})} className="px-2 border border-slate-300 rounded-md hover:bg-slate-100 text-slate-500 bg-white shadow-sm transition-colors" title="Hủy thêm mới"><X size={16}/></button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Thời gian</label>
                <div className="flex gap-2">
                  <select value={formData.dayIndex} onChange={e => setFormData({...formData, dayIndex: parseInt(e.target.value)})} className="w-1/2 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white">
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                  <select value={formData.periodId} onChange={e => setFormData({...formData, periodId: parseInt(e.target.value)})} className="w-1/2 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm bg-white">
                    {PERIODS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.time})</option>)}
                  </select>
                </div>
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
                <span className={`text-lg font-bold transition-colors duration-300 ${isOverCapacity ? 'text-red-600' : 'text-blue-700'}`}>
                  {currentStudents} <span className="text-sm text-slate-400 font-normal"> / {roomCapacity} SV</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full transition-all duration-500 ease-out ${isOverCapacity ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${percentage}%` }}></div>
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
  );
}
