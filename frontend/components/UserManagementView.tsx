import React from 'react';
import { User } from '../types';
import { PencilIcon, TrashIcon, PlusIcon, ShieldCheckIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface UserManagementViewProps {
  users: User[];
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  canEdit: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: 'next' | 'prev') => void;
  totalUsers: number;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ 
    users, 
    onAdd, 
    onEdit, 
    onDelete, 
    canEdit,
    searchQuery,
    onSearchChange,
    currentPage,
    totalPages,
    onPageChange,
    totalUsers
}) => {

  const PaginationControls = () => (
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-lg">
        <div className="mb-2 sm:mb-0">
          <p className="text-sm text-slate-700 dark:text-slate-400">
            Hiển thị <span className="font-medium">{users.length}</span> trên <span className="font-medium">{totalUsers}</span> kết quả
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange('prev')}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1"/>
            Trước
          </button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Trang {currentPage} / {totalPages > 0 ? totalPages : 1}
          </span>
          <button
            onClick={() => onPageChange('next')}
            disabled={currentPage === totalPages || totalPages === 0}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
            <ChevronRightIcon className="w-4 h-4 ml-1"/>
          </button>
        </div>
      </div>
    );

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg animate-fade-in-left border border-slate-200 dark:border-slate-700 flex flex-col" style={{ height: 'calc(100vh - 8rem)'}}>
      <div className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Danh sách người dùng</h3>
            <button
              onClick={onAdd}
              disabled={!canEdit}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Thêm người dùng
            </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên, tên đăng nhập..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-700/50 border-2 border-transparent rounded-lg py-2 pl-10 pr-4 text-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
          />
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {totalUsers > 0 ? (
          <>
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-400 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3">Tên</th>
                    <th scope="col" className="px-6 py-3">Tên đăng nhập</th>
                    <th scope="col" className="px-6 py-3">Vai trò</th>
                    <th scope="col" className="px-6 py-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4">{user.username}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200'}`}>
                          <ShieldCheckIcon className={`w-3 h-3 mr-1 ${user.role === 'Admin' ? 'text-indigo-500' : 'text-slate-500'}`} />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button disabled={!canEdit} onClick={() => onEdit(user)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition" title="Sửa người dùng">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button disabled={!canEdit} onClick={() => onDelete(user)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition" title="Xóa người dùng">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden p-4 space-y-4">
              {users.map(user => (
                <div key={user.id} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.username}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button disabled={!canEdit} onClick={() => onEdit(user)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition" title="Sửa người dùng">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button disabled={!canEdit} onClick={() => onDelete(user)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition" title="Xóa người dùng">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200'}`}>
                      <ShieldCheckIcon className={`w-3 h-3 mr-1 ${user.role === 'Admin' ? 'text-indigo-500' : 'text-slate-500'}`} />
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                {searchQuery ? `Không tìm thấy người dùng khớp với "${searchQuery}"` : 'Chưa có người dùng nào.'}
              </p>
            </div>
        )}
      </div>
      <PaginationControls />
    </div>
  );
};

export default UserManagementView;