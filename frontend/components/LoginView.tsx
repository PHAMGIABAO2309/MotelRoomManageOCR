import React, { useState } from 'react';
import { BuildingOfficeIcon, UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from './icons';
import { LANDLORD_INFO } from '../constants';

interface LoginViewProps {
  onLogin: (username: string, password: string) => boolean;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <div className="w-full max-w-md space-y-8">
            <div>
                <BuildingOfficeIcon className="mx-auto h-16 w-auto text-indigo-500" />
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Đăng nhập vào tài khoản
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Để quản lý {LANDLORD_INFO.name.toLowerCase()}
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label htmlFor="username" className="sr-only">Tên đăng nhập</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <UserIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="relative block w-full appearance-none rounded-t-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-3 py-3 pl-10 text-slate-900 dark:text-white placeholder-slate-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Tên đăng nhập (vd: admin, phong101)"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password"className="sr-only">Mật khẩu</label>
                        <div className="relative">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <LockClosedIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full appearance-none rounded-b-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-3 py-3 pl-10 text-slate-900 dark:text-white placeholder-slate-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Mật khẩu (vd: password123, sđt)"
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center justify-center">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors"
                    >
                        Đăng nhập
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default LoginView;
