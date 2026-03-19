import React, { useState } from 'react';
import { X, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      onClose(); // auto close on success
    } catch (err) {
      console.error(err);
      setError('Đăng nhập thất bại. Tài khoản hoặc mật khẩu không chính xác.');
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-blue-600 p-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors"><X size={20}/></button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Đăng nhập Quản trị</h2>
          <p className="text-blue-100 text-sm mt-1">Chỉ dành cho cán bộ có thẩm quyền xếp lịch</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</div>}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="admin@domain.com"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••"/>
          </div>
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2">
            <LogIn size={18} /> {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
          </button>
        </form>
      </div>
    </div>
  );
}
