import React, { useMemo } from 'react';
import { Room, UsageRecord, Tenant } from '../types';
import { ArrowLeftIcon, UserIcon, PencilIcon, UsersIcon } from './icons';
import { ELECTRIC_RATE, WATER_RATE } from '../constants';
import BillHistory from './BillHistory';

interface RoomDetailViewProps {
  room: Room;
  onBack: () => void;
  onOpenModal: (type: 'manageTenants' | 'recordUsage') => void;
  onMarkAsPaid: (roomId: string, recordId: string) => void;
  onOpenInvoice: (room: Room, record: UsageRecord) => void;
  onOpenEditUsageModal: (record: UsageRecord) => void;
  onDeleteUsageRecord: (recordId: string) => void;
  onOpenTenantDetail: (tenant: Tenant) => void;
  canEdit: boolean;
  onOpenCheckoutModal: () => void;
  onOpenPaymentQRModal: (room: Room, record: UsageRecord) => void;
}

const RoomDetailView: React.FC<RoomDetailViewProps> = ({ room, onBack, onOpenModal, onMarkAsPaid, onOpenInvoice, onOpenEditUsageModal, onDeleteUsageRecord, onOpenTenantDetail, canEdit, onOpenCheckoutModal, onOpenPaymentQRModal }) => {
  
  const archivedHistoriesByTenant = useMemo(() => {
    if (!room.archivedUsageHistory || room.archivedUsageHistory.length === 0) {
        return [];
    }

    const groups: { [tenantId: string]: { tenant: Tenant, records: UsageRecord[] } } = {};
    
    // This logic is imperfect for multi-tenant history, as it groups by the first tenant in the snapshot.
    // For simplicity, we'll group by the first tenant's ID.
    for (const record of room.archivedUsageHistory) {
        if (record.tenantsSnapshot.length === 0) continue;
        const primaryTenant = record.tenantsSnapshot[0];
        const tenantId = primaryTenant.id;
        if (!groups[tenantId]) {
            groups[tenantId] = {
                tenant: primaryTenant, // The representative tenant for this group
                records: []
            };
        }
        groups[tenantId].records.push(record);
    }

    return Object.values(groups).sort((a, b) => {
        if (a.records.length === 0 || b.records.length === 0) return 0;
        const lastRecordA = a.records[a.records.length - 1];
        const lastRecordB = b.records[b.records.length - 1];
        return new Date(lastRecordB.endDate).getTime() - new Date(lastRecordA.endDate).getTime();
    });
  }, [room.archivedUsageHistory]);
  
  return (
    <div className="p-3 sm:p-5 bg-white dark:bg-slate-800 shadow-lg rounded-lg animate-fade-in-left border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="p-2 mr-2 sm:mr-4 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
          <ArrowLeftIcon className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{room.name} - Chi Tiết</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Tenant Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg mb-3 text-slate-800 dark:text-slate-100 flex items-center"><UsersIcon className="mr-2"/>Thông Tin Người Thuê</h3>
            <button 
                disabled={!canEdit} 
                onClick={() => onOpenModal('manageTenants')} 
                className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                title={"Quản lý người thuê"}
            >
                <PencilIcon className="w-5 h-5"/>
            </button>
          </div>
          {room.tenants.length > 0 ? (
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {room.tenants.map(tenant => (
                <div 
                  key={tenant.id} 
                  onClick={() => onOpenTenantDetail(tenant)}
                  className="flex items-start space-x-3 p-2 rounded-md bg-white dark:bg-slate-700/50 shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  role="button"
                  aria-label={`Xem chi tiết của ${tenant.name}`}
                >
                  {tenant.avatarUrl ? (
                      <img src={tenant.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-lg object-cover border-2 border-slate-300 dark:border-slate-600" />
                  ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-8 h-8 text-slate-400" />
                      </div>
                  )}
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                      <p className="font-bold">{tenant.name}</p>
                      <p>SĐT: {tenant.phone}</p>
                      {tenant.idNumber && <p>CCCD: {tenant.idNumber}</p>}
                      <p>Ngày vào: {new Date(tenant.moveInDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-slate-500 dark:text-slate-400">Phòng trống. Nhấn nút chỉnh sửa <PencilIcon className="inline-block w-4 h-4 align-text-bottom" /> ở trên để thêm người thuê.</p>
            </div>
          )}
        </div>
        {/* Room Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-lg mb-3 text-slate-800 dark:text-slate-100">Thông Tin Phòng</h3>
            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <p><strong>Giá thuê cơ bản:</strong> {room.baseRent.toLocaleString('vi-VN')} VND/tháng</p>
                <p><strong>Giá điện:</strong> {ELECTRIC_RATE.toLocaleString('vi-VN')} VND/kWh</p>
                <p><strong>Giá nước:</strong> {WATER_RATE.toLocaleString('vi-VN')} VND/m³</p>
                <p><strong>Trạng thái:</strong> <span className={room.status === 'occupied' ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}>{room.status === 'occupied' ? 'Đã có người' : 'Còn trống'}</span></p>
                <div className="mt-2 flex items-center space-x-2">
                  <button onClick={() => onOpenModal('recordUsage')} disabled={room.tenants.length === 0 || !canEdit} className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg px-3 py-1.5 text-center disabled:bg-slate-400 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-800">Ghi Điện Nước</button>
                  <button onClick={onOpenCheckoutModal} disabled={room.tenants.length === 0 || !canEdit} className="text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:ring-4 focus:outline-none focus:ring-rose-300 rounded-lg px-3 py-1.5 text-center disabled:bg-slate-400 disabled:cursor-not-allowed dark:bg-rose-500 dark:hover:bg-rose-600 dark:focus:ring-rose-800">Trả phòng</button>
                </div>
            </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-xl mb-4 text-slate-800 dark:text-slate-100">
          Lịch Sử Hóa Đơn Hiện tại
        </h3>
        <BillHistory 
            invoices={room.usageHistory} 
            onMarkAsPaid={(invoice) => onMarkAsPaid(room.id, invoice.id)} 
            onOpenInvoice={(invoice) => onOpenInvoice(room, invoice)}
            onOpenEdit={onOpenEditUsageModal}
            onDelete={(invoice) => onDeleteUsageRecord(invoice.id)}
            onOpenTenantDetail={(invoice) => invoice.tenantsSnapshot[0] && onOpenTenantDetail(invoice.tenantsSnapshot[0])}
            onOpenPaymentQR={(invoice) => onOpenPaymentQRModal(room, invoice)}
            canEdit={canEdit}
            displayRoomInfo={false}
        />
      </div>

      {archivedHistoriesByTenant.map((group) => (
        <div key={group.tenant.id} className="mt-8">
          <h3 className="font-semibold text-xl mb-4 text-slate-800 dark:text-slate-100">
            Lịch sử cũ (Người thuê: {group.tenant.name},...)
          </h3>
          <BillHistory
              invoices={group.records}
              onOpenInvoice={(invoice) => onOpenInvoice(room, invoice)}
              onOpenTenantDetail={(invoice) => invoice.tenantsSnapshot[0] && onOpenTenantDetail(invoice.tenantsSnapshot[0])}
              canEdit={false}
              displayRoomInfo={false}
          />
        </div>
      ))}
    </div>
  );
};

export default RoomDetailView;