import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Room, UsageRecord, Tenant } from '../types';
import { PrinterIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, HomeIcon, CheckCircleIcon, ClockIcon, CalendarDaysIcon, ChevronUpDownIcon, DocumentArrowDownIcon } from './icons';
import BillHistory from './BillHistory';

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


type InvoiceWithRoom = UsageRecord & { roomId: string; roomName: string };

interface InvoiceManagementViewProps {
  rooms: Room[];
  invoices: InvoiceWithRoom[];
  totalInvoices: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (direction: 'next' | 'prev') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filterRoomId: string;
  onFilterRoomIdChange: (id: string) => void;
  filterStatus: 'all' | 'paid' | 'unpaid';
  onFilterStatusChange: (status: 'all' | 'paid' | 'unpaid') => void;
  sortBy: 'newest' | 'oldest';
  onSortByChange: (sortBy: 'newest' | 'oldest') => void;
  onOpenInvoice: (room: Room, record: UsageRecord) => void;
  onOpenPaymentQRModal: (room: Room, record: UsageRecord) => void;
  onMarkAsPaid: (roomId: string, recordId: string) => void;
  canEdit: boolean;
  onExportToExcel: () => void;
  onEditInvoice: (invoice: InvoiceWithRoom) => void;
  onDeleteInvoice: (invoice: InvoiceWithRoom) => void;
  onOpenTenantDetail: (tenant: Tenant) => void;
}

const InvoiceManagementView: React.FC<InvoiceManagementViewProps> = ({ 
    rooms, 
    invoices, 
    totalInvoices,
    totalPages,
    currentPage,
    onPageChange,
    searchQuery,
    onSearchQueryChange,
    filterRoomId,
    onFilterRoomIdChange,
    filterStatus,
    onFilterStatusChange,
    sortBy,
    onSortByChange,
    onOpenInvoice,
    onOpenPaymentQRModal,
    onMarkAsPaid, 
    canEdit,
    onExportToExcel,
    onEditInvoice,
    onDeleteInvoice,
    onOpenTenantDetail
}) => {

  const findRoomForInvoice = (invoice: typeof invoices[0]): Room | undefined => {
      return rooms.find(r => r.id === invoice.roomId);
  }
  
  const roomOptions: CustomSelectOption[] = useMemo(() => [
    { value: 'all', label: 'Tất cả phòng', icon: <HomeIcon className="w-5 h-5 text-slate-500"/> },
    ...rooms.map(room => ({
        value: room.id,
        label: room.name,
        icon: <div className={`w-3 h-3 rounded-full ${room.status === 'occupied' ? 'bg-teal-500' : 'bg-amber-500'} ml-1`}></div>
    }))
  ], [rooms]);

  const statusOptions: CustomSelectOption[] = [
      { value: 'all', label: 'Tất cả trạng thái' },
      { value: 'paid', label: 'Đã thanh toán', icon: <CheckCircleIcon className="w-5 h-5 text-teal-500"/> },
      { value: 'unpaid', label: 'Chưa thanh toán', icon: <ClockIcon className="w-5 h-5 text-amber-500"/> }
  ];

  const sortOptions: CustomSelectOption[] = [
      { value: 'newest', label: 'Mới nhất trước' },
      { value: 'oldest', label: 'Cũ nhất trước' }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg animate-fade-in-left border border-slate-200 dark:border-slate-700">
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Quản lý hóa đơn</h3>
        <p className="text-sm text-slate-500 mt-1">Xem và quản lý tất cả hóa đơn từ các phòng.</p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div className="sm:col-span-2 lg:col-span-1">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm phòng, người thuê..."
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    />
                </div>
            </div>
            <div>
              <CustomSelect
                options={roomOptions}
                value={filterRoomId}
                onChange={onFilterRoomIdChange}
              />
            </div>
            <div>
                <CustomSelect
                    options={statusOptions}
                    value={filterStatus}
                    onChange={value => onFilterStatusChange(value as any)}
                />
            </div>
            <div>
                <CustomSelect
                    options={sortOptions}
                    value={sortBy}
                    onChange={value => onSortByChange(value as any)}
                    placeholder="Sắp xếp theo"
                    icon={<CalendarDaysIcon className="w-5 h-5 text-slate-500" />}
                />
            </div>
        </div>
        <div className="pt-4">
             <button
                onClick={onExportToExcel}
                disabled={filterRoomId === 'all'}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                title={filterRoomId === 'all' ? "Chọn một phòng cụ thể để bật tính năng này" : "Xuất Excel tất cả hóa đơn của phòng đã chọn"}
            >
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                In Excel tất cả hóa đơn
            </button>
        </div>
      </div>
      
      {/* Invoice List */}
      <div className="overflow-x-auto">
        <BillHistory
            invoices={invoices}
            canEdit={canEdit}
            displayRoomInfo={true}
            onMarkAsPaid={(invoice) => onMarkAsPaid(invoice.roomId!, invoice.id)}
            onOpenInvoice={(invoice) => {
                const room = findRoomForInvoice(invoice as InvoiceWithRoom);
                if(room) onOpenInvoice(room, invoice);
            }}
            onOpenPaymentQR={(invoice) => {
                const room = findRoomForInvoice(invoice as InvoiceWithRoom);
                if(room) onOpenPaymentQRModal(room, invoice);
            }}
            onOpenEdit={(invoice) => onEditInvoice(invoice as InvoiceWithRoom)}
            onDelete={(invoice) => onDeleteInvoice(invoice as InvoiceWithRoom)}
            onOpenTenantDetail={(invoice) => invoice.tenantsSnapshot[0] && onOpenTenantDetail(invoice.tenantsSnapshot[0])}
        />
      </div>

       {/* Pagination */}
      {totalPages > 1 && (
         <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-700">
            <div className="mb-2 sm:mb-0">
                <p className="text-sm text-slate-700 dark:text-slate-400">
                    Hiển thị <span className="font-medium">{invoices.length}</span> trên <span className="font-medium">{totalInvoices}</span> kết quả
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
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Sau
                    <ChevronRightIcon className="w-4 h-4 ml-1"/>
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default InvoiceManagementView;