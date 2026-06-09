import React, { useState } from 'react';
import { X, Copy, AlertTriangle, CheckCircle } from 'lucide-react';
import { ACADEMIC_YEARS, SEMESTERS } from '../../constants/data';

export default function CopyDataModal({
  isOpen,
  onClose,
  currentYear,
  currentSemester,
  onCopy
}) {
  const [sourceYear, setSourceYear] = useState(currentYear);
  const [sourceSemester, setSourceSemester] = useState(currentSemester);
  const [copyOptions, setCopyOptions] = useState({
    classes: true,
    rooms: true,
    instructors: true
  });
  const [mergeOption, setMergeOption] = useState('MERGE'); // MERGE | OVERWRITE
  const [isCopying, setIsCopying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCopySubmit = async () => {
    setErrorMsg('');
    if (sourceYear === currentYear && sourceSemester === currentSemester) {
      setErrorMsg('Học kỳ nguồn và học kỳ đích hiện tại không được trùng nhau.');
      return;
    }
    if (!copyOptions.classes && !copyOptions.rooms && !copyOptions.instructors) {
      setErrorMsg('Vui lòng chọn ít nhất một loại dữ liệu để sao chép.');
      return;
    }

    const confirmMsg = mergeOption === 'OVERWRITE'
      ? 'CẢNH BÁO: Chế độ GHI ĐÈ sẽ XÓA SẠCH dữ liệu đã chọn của học kỳ đích hiện tại trước khi sao chép. Bạn có chắc chắn muốn tiếp tục?'
      : 'Hệ thống sẽ sao chép dữ liệu từ học kỳ nguồn vào học kỳ đích hiện tại. Các dữ liệu trùng tên sẽ được cập nhật. Bạn có chắc chắn muốn tiếp tục?';

    if (!window.confirm(confirmMsg)) return;

    setIsCopying(true);
    try {
      const success = await onCopy(sourceYear, sourceSemester, copyOptions, mergeOption);
      if (success) {
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Đã xảy ra lỗi trong quá trình sao chép.');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[520px] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-blue-700">
            <Copy size={20} />
            <h3 className="font-bold text-lg text-slate-800">Sao Chép Dữ Liệu Học Kỳ</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X size={20}/>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto max-h-[70vh] space-y-4">
          
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm flex items-start gap-2 animate-shake">
              <AlertTriangle className="shrink-0 mt-0.5" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Info */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-md text-sm">
            <span className="text-slate-500 block font-medium mb-1">Học kỳ đích (Đang hiển thị):</span>
            <span className="font-bold text-slate-800">
              Năm học {currentYear} — {SEMESTERS.find(s => s.id === currentSemester)?.name || currentSemester}
            </span>
          </div>

          {/* Source Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
              Học kỳ nguồn (Lấy dữ liệu từ)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Năm học</label>
                <select 
                  value={sourceYear}
                  onChange={e => setSourceYear(e.target.value)}
                  className="w-full text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-50 cursor-pointer shadow-sm"
                >
                  {ACADEMIC_YEARS.map(year => (
                    <option key={year} value={year}>Năm học {year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Học kỳ</label>
                <select 
                  value={sourceSemester}
                  onChange={e => setSourceSemester(e.target.value)}
                  className="w-full text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-50 cursor-pointer shadow-sm"
                >
                  {SEMESTERS.map(sem => (
                    <option key={sem.id} value={sem.id}>{sem.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Options Selection */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
              Dữ liệu cần sao chép
            </label>
            <div className="space-y-2 border border-slate-200 rounded-md p-3.5 bg-white">
              <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors select-none">
                <input 
                  type="checkbox" 
                  checked={copyOptions.classes} 
                  onChange={e => setCopyOptions({ ...copyOptions, classes: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800">Dữ liệu Lớp học</span>
                  <span className="text-xs text-slate-400">Danh sách lớp, sĩ số, ngành học, giảng viên phụ trách (Lưu ý: Lớp học copy sang sẽ ở trạng thái chờ xếp lịch)</span>
                </div>
              </label>
              <div className="h-px bg-slate-100"></div>
              <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors select-none">
                <input 
                  type="checkbox" 
                  checked={copyOptions.rooms} 
                  onChange={e => setCopyOptions({ ...copyOptions, rooms: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800">Dữ liệu Phòng học</span>
                  <span className="text-xs text-slate-400">Danh sách các phòng họp và sức chứa tối đa tương ứng</span>
                </div>
              </label>
              <div className="h-px bg-slate-100"></div>
              <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors select-none">
                <input 
                  type="checkbox" 
                  checked={copyOptions.instructors} 
                  onChange={e => setCopyOptions({ ...copyOptions, instructors: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800">Dữ liệu Giảng viên</span>
                  <span className="text-xs text-slate-400">Danh sách giảng viên giảng dạy và quản lý học phần</span>
                </div>
              </label>
            </div>
          </div>

          {/* Merge Option Selection */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
              Phương thức sao chép
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`border rounded-lg p-3 flex flex-col items-center gap-1.5 cursor-pointer transition-all text-center select-none ${mergeOption === 'MERGE' ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input 
                  type="radio" 
                  name="mergeOption" 
                  value="MERGE"
                  checked={mergeOption === 'MERGE'}
                  onChange={() => setMergeOption('MERGE')}
                  className="sr-only"
                />
                <span className="font-bold text-sm text-slate-800">Hợp nhất dữ liệu</span>
                <span className="text-[11px] text-slate-500 leading-normal">
                  Chỉ thêm dữ liệu mới và cập nhật bản ghi trùng tên. Giữ nguyên dữ liệu hiện tại.
                </span>
              </label>

              <label className={`border rounded-lg p-3 flex flex-col items-center gap-1.5 cursor-pointer transition-all text-center select-none ${mergeOption === 'OVERWRITE' ? 'border-red-500 bg-red-50/40 ring-1 ring-red-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input 
                  type="radio" 
                  name="mergeOption" 
                  value="OVERWRITE"
                  checked={mergeOption === 'OVERWRITE'}
                  onChange={() => setMergeOption('OVERWRITE')}
                  className="sr-only"
                />
                <span className="font-bold text-sm text-red-700">Ghi đè hoàn toàn</span>
                <span className="text-[11px] text-slate-500 leading-normal">
                  Xóa sạch dữ liệu cũ của các loại đã chọn tại học kỳ đích và chép mới.
                </span>
              </label>
            </div>
          </div>

          {mergeOption === 'OVERWRITE' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <AlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={15} />
              <span>
                <strong>Cảnh báo:</strong> Việc chọn ghi đè sẽ xóa sạch danh sách lịch họp đã phân bổ (nếu chọn ghi đè Lớp hoặc Phòng) để tránh lỗi tham chiếu chéo. Hãy cẩn trọng!
              </span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-xs text-slate-400 hidden sm:block">Chỉ dành cho quản trị viên</span>
          <div className="flex gap-2 ml-auto">
            <button 
              onClick={onClose} 
              disabled={isCopying}
              className="px-4 py-2 text-sm font-semibold border rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button 
              onClick={handleCopySubmit} 
              disabled={isCopying}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isCopying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang sao chép...
                </>
              ) : (
                <>
                  <Copy size={16}/>
                  Thực hiện sao chép
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
