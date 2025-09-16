import React, { useState, useRef } from 'react';
import { User } from '../types';
import { UserCircleIcon, LockClosedIcon, CameraIcon, UserIcon } from './icons';

interface EditProfileViewProps {
  currentUser: User;
  onSaveProfile: (updatedData: Partial<User> & { newPassword?: string }) => Promise<void>;
  onBack: () => void;
}

const EditProfileView: React.FC<EditProfileViewProps> = ({ currentUser, onSaveProfile, onBack }) => {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        clearMessages();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    setIsSaving(true);
    try {
      await onSaveProfile({
        id: currentUser.id,
        name,
        username,
        avatarUrl,
        newPassword: newPassword || undefined,
      });
      setSuccessMessage('Cập nhật hồ sơ thành công!');
      setNewPassword('');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Đã có lỗi xảy ra.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white";

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg animate-fade-in-left border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
      <form onSubmit={handleSaveChanges}>
        <div className="p-4 sm:p-6 space-y-6">
          
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 dark:border-slate-600" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center border-4 border-slate-200 dark:border-slate-600">
                  <UserIcon className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
                title="Đổi ảnh đại diện"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center mb-4">
              <UserCircleIcon className="w-6 h-6 mr-2" />
              Thông tin cá nhân
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Họ và tên</label>
                <input type="text" id="fullName" value={name} onChange={e => { setName(e.target.value); clearMessages(); }} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Tên đăng nhập</label>
                <input type="text" id="username" value={username} onChange={e => { setUsername(e.target.value); clearMessages(); }} className={inputClass} required />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center mb-4">
              <LockClosedIcon className="w-6 h-6 mr-2" />
              Đổi mật khẩu
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Mật khẩu mới</label>
                <input type="password" id="newPassword" value={newPassword} placeholder="Để trống nếu không muốn thay đổi" onChange={e => { setNewPassword(e.target.value); clearMessages(); }} className={inputClass} autoComplete="new-password" />
              </div>
            </div>
          </div>
          
          {successMessage && <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>}
          {errorMessage && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}
        </div>
        
        <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg space-x-2">
          <button type="button" onClick={onBack} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">
            Quay lại
          </button>
          <button type="submit" disabled={isSaving} className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:bg-slate-400 disabled:cursor-not-allowed">
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileView;