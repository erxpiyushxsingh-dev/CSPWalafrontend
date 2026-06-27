'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Loader2, X, Shield, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginAdmin } from '@/redux/slices/authslice';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    mobile: '',
    password: '',
  });
    const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  const result = await dispatch(loginAdmin(form));
  
  if (loginAdmin.fulfilled.match(result)) {
    toast.success('Admin login successful!');
    onClose();
    setNavigating(true);
    router.push('/admin/dashboard');
  } else {
    setLoading(false);
    toast.error((result.payload as string) || 'Admin login failed');
  }
};

  if (!isOpen) return null;

  return (
    <>
      {/* Navigation Loader Overlay */}
      {navigating && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin w-10 h-10 text-purple-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">Redirecting to dashboard...</p>
          </div>
        </div>
      )}
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Admin Login</h2>
                  <p className="text-sm opacity-90">Access admin panel</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200/50 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="admin-mobile" className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
              <input
                id="admin-mobile"
                name="mobile"
                type="tel"
                maxLength={10}
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200/50 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200/50 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 
              text-white font-bold text-sm rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed 
              flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Login as Admin <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}