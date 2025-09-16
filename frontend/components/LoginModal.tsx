import React, { useState } from 'react';
import Modal from './Modal';
import { EyeIcon, EyeSlashIcon } from './icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(username, password);
    if (!success) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đăng Nhập">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Tên đăng nhập</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
            placeholder="admin hoặc phong101"
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-10 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
              placeholder="password123"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Hủy</button>
            <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">Đăng nhập</button>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;