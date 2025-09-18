import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Tenant, Room } from '../types';
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, IdentificationIcon, UserIcon, HomeIcon, ChevronUpDownIcon } from './icons';

// --- Custom Select Component ---
interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => options.find(option => option.value === value) || null, [options, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-sm px-3 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center truncate">
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="mr-2 h-5 w-5 flex-shrink-0">{selectedOption.icon}</span>}
              <span className="text-slate-800 dark:text-slate-100">{selectedOption.label}</span>
            </>
          ) : (
            <>
              {icon && <span className="mr-2 h-5 w-5 text-slate-500">{icon}</span>}
              <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
            </>
          )}
        </span>
        <ChevronUpDownIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto animate-fade-in-up">
          <ul role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`flex items-center px-3 py-2 text-sm cursor-pointer transition-colors ${
                  value === option.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                role="option"
                aria-selected={value === option.value}
              >
                {option.icon && <span className="mr-3 h-5 w-5 flex-shrink-0">{option.icon}</span>}
                <span className="truncate">{option.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
// --- End Custom Select Component ---

interface TenantArchiveViewProps {
  tenants: (Tenant & { roomName: string; roomId: string; })[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: 'next' | 'prev') => void;
  totalTenants: number;
  rooms: Room[];
  filterRoomId: string;
  onFilterRoomIdChange: (id: string) => void;
  onOpenTenantDetail: (tenant: Tenant) => void;
}

const TenantArchiveView: React.FC<TenantArchiveViewProps> = ({ 
    tenants, 
    searchQuery,
    onSearchChange,
    currentPage,
    totalPages,
    onPageChange,
    totalTenants,
    rooms,
    filterRoomId,
    onFilterRoomIdChange,
    onOpenTenantDetail
}) => {
    
  const roomOptions: CustomSelectOption[] = useMemo(() => [
    { value: 'all', label: 'Tất cả phòng', icon: <HomeIcon className="w-5 h-5 text-slate-500"/> },
    ...rooms.map(room => ({
        value: room.id,
        label: room.name,
        icon: <div className={`w-3 h-3 rounded-full ${room.status === 'occupied' ? 'bg-teal-500' : 'bg-amber-500'} ml-1`}></div>
    }))
  ], [rooms]);

  const PaginationControls = () => (
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-lg">
        <div className="mb-2 sm:mb-0">
          <p className="text-sm text-slate-700 dark:text-slate-400">
            Hiển thị <span className="font-medium">{tenants.length}</span> trên <span className="font-medium">{totalTenants}</span> kết quả
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
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Kho lưu trữ người thuê</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT, CCCD..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-700/50 border-2 border-transparent rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
              />
            </div>
             <div>
              <CustomSelect
                options={roomOptions}
                value={filterRoomId}
                onChange={onFilterRoomIdChange}
              />
            </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {totalTenants > 0 ? (
          <>
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-400 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3">Họ và tên</th>
                    <th scope="col" className="px-6 py-3">Phòng</th>
                    <th scope="col" className="px-6 py-3">Số điện thoại</th>
                    <th scope="col" className="px-6 py-3">Số CCCD</th>
                    <th scope="col" className="px-6 py-3">Ngày vào</th>
                    <th scope="col" className="px-6 py-3 text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(tenant => (
                    <tr 
                      key={tenant.id}
                      onClick={() => onOpenTenantDetail(tenant)}
                      className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{tenant.name}</td>
                        <td className="px-6 py-4">{tenant.roomName}</td>
                        <td className="px-6 py-4">{tenant.phone}</td>
                        <td className="px-6 py-4">{tenant.idNumber || 'N/A'}</td>
                        <td className="px-6 py-4">{new Date(tenant.moveInDate).toLocaleDateString('vi-VN')}</td>
                        <td className="px-6 py-4 text-center">
                            <IdentificationIcon className="w-5 h-5 text-slate-500 inline-block" />
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden p-4 space-y-4">
                {tenants.map(tenant => (
                  <div 
                    key={tenant.id} 
                    onClick={() => onOpenTenantDetail(tenant)}
                    className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                            <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                {tenant.avatarUrl ? (
                                    <img src={tenant.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover"/>
                                ) : (
                                    <UserIcon className="w-6 h-6 text-slate-400"/>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-base text-slate-800 dark:text-white">{tenant.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{tenant.phone}</p>
                            </div>
                        </div>
                        <IdentificationIcon className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300">
                      <p><strong>Phòng:</strong> {tenant.roomName}</p>
                      <p><strong>CCCD:</strong> {tenant.idNumber || 'N/A'}</p>
                      <p><strong>Ngày vào:</strong> {new Date(tenant.moveInDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                {searchQuery ? `Không tìm thấy người thuê khớp với "${searchQuery}"` : 'Không có người thuê nào trong phòng này.'}
              </p>
            </div>
        )}
      </div>
      <PaginationControls />
    </div>
  );
};

export default TenantArchiveView;