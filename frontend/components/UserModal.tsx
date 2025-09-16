import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { User } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  userToEdit?: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const isEditMode = !!userToEdit;
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Staff'>('Staff');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && userToEdit) {
        setName(userToEdit.name);
        setUsername(userToEdit.username);
        setRole(userToEdit.role);
        setPassword(''); // Password should be empty for editing, only set if changed
      } else {
        setName('');
        setUsername('');
        setPassword('');
        setRole('Staff');
      }
      setError('');
    }
  }, [isOpen, userToEdit, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || (!isEditMode && !password.trim())) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    const savedUser: User = {
      id: isEditMode ? userToEdit!.id : crypto.randomUUID(),
      name,
      username,
      role,
      ...(password && { password }), // Only include password if it's set
    };
    onSave(savedUser);
    onClose();
  };

  const inputClass = "bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Họ và tên</label>
          <input type="text" id="fullName" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="username" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Tên đăng nhập</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">
            Mật khẩu {isEditMode && <span className="text-xs font-normal text-slate-400">(để trống nếu không đổi)</span>}
          </label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required={!isEditMode} />
        </div>
        <div>
          <label htmlFor="role" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Vai trò</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'Admin' | 'Staff')} className={inputClass}>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end pt-4 space-x-2 border-t border-slate-200 dark:border-slate-700 mt-4">
          <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Hủy</button>
          <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
            {isEditMode ? 'Lưu thay đổi' : 'Thêm người dùng'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;