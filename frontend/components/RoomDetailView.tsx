import React, { useMemo } from 'react';
import { Room, UsageRecord, Tenant } from '../types';
import { ArrowLeftIcon, UserIcon, PencilIcon } from './icons';
import { ELECTRIC_RATE, WATER_RATE } from '../constants';
import BillHistory from './BillHistory';

interface RoomDetailViewProps {
  room: Room;
  onBack: () => void;
  onOpenModal: (type: 'assignTenant' | 'recordUsage' | 'editTenant') => void;
  onMarkAsPaid: (roomId: string, recordId: string) => void;
  onRemoveTenant: () => void;
  onOpenInvoice: (room: Room, record: UsageRecord) => void;
  onOpenEditUsageModal: (record: UsageRecord) => void;
  onDeleteUsageRecord: (recordId: string) => void;
  onOpenTenantDetail: (tenant: Tenant) => void;
  canEdit: boolean;
  onOpenCheckoutModal: () => void;
}

const RoomDetailView: React.FC<RoomDetailViewProps> = ({ room, onBack, onOpenModal, onMarkAsPaid, onRemoveTenant, onOpenInvoice, onOpenEditUsageModal, onDeleteUsageRecord, onOpenTenantDetail, canEdit, onOpenCheckoutModal }) => {
  const tenantModalAction = room.status === 'occupied' && room.tenant ? 'editTenant' : 'assignTenant';
  
  const archivedHistoriesByTenant = useMemo(() => {
    if (!room.archivedUsageHistory || room.archivedUsageHistory.length === 0) {
        return [];
    }

    const groups: { [tenantId: string]: { tenant: Tenant, records: UsageRecord[] } } = {};

    // Group records by tenant ID
    for (const record of room.archivedUsageHistory) {
        const tenantId = record.tenantSnapshot.id;
        if (!groups[tenantId]) {
            groups[tenantId] = {
                tenant: record.tenantSnapshot,
                records: []
            };
        }
        groups[tenantId].records.push(record);
    }

    // Convert the groups object into an array and sort it
    return Object.values(groups).sort((a, b) => {
        // Ensure there are records to sort by
        if (a.records.length === 0 || b.records.length === 0) return 0;
        // Sort by the end date of the last record for each tenant, showing the most recent past tenant first
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
            <h3 className="font-semibold text-lg mb-3 text-slate-800 dark:text-slate-100 flex items-center"><UserIcon className="mr-2"/>Thông Tin Người Thuê</h3>
            <button 
                disabled={!canEdit} 
                onClick={() => onOpenModal(tenantModalAction)} 
                className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                title={tenantModalAction === 'editTenant' ? "Chỉnh sửa thông tin" : "Thêm người thuê mới"}
            >
                <PencilIcon className="w-5 h-5"/>
            </button>
          </div>
          {room.tenant ? (
            <div className="flex items-start space-x-3">
                 {room.tenant.avatarUrl ? (
                    <img src={room.tenant.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-lg object-cover border-2 border-slate-300 dark:border-slate-600" />
                ) : (
                    <div className="w-20 h-20 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                        <UserIcon className="w-10 h-10 text-slate-400" />
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm flex-1 text-slate-700 dark:text-slate-300">
                    <div className="sm:col-span-2">
                        <p><strong>Tên:</strong> {room.tenant.name}</p>
                    </div>
                    {room.tenant.dateOfBirth && <div><p><strong>Ngày sinh:</strong> {new Date(room.tenant.dateOfBirth).toLocaleDateString('vi-VN')}</p></div>}
                    {room.tenant.sex && <div><p><strong>Giới tính:</strong> {room.tenant.sex}</p></div>}
                    {room.tenant.idNumber && <div><p><strong>CCCD:</strong> {room.tenant.idNumber}</p></div>}
                    <div><p><strong>SĐT:</strong> {room.tenant.phone}</p></div>
                    <div><p><strong>Ngày vào:</strong> {new Date(room.tenant.moveInDate).toLocaleDateString('vi-VN')}</p></div>
                    {room.tenant.nationality && <div><p><strong>Quốc tịch:</strong> {room.tenant.nationality}</p></div>}
                    {room.tenant.placeOfOrigin && <div className="sm:col-span-2"><p><strong>Quê quán:</strong> {room.tenant.placeOfOrigin}</p></div>}
                    {room.tenant.placeOfResidence && <div className="sm:col-span-2"><p><strong>Nơi thường trú:</strong> {room.tenant.placeOfResidence}</p></div>}
                    <div className="sm:col-span-2">
                        <button disabled={!canEdit || room.status !== 'occupied'} onClick={onRemoveTenant} className="text-sm text-red-500 hover:underline mt-2 disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed">Xóa người thuê</button>
                    </div>
                </div>
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
                  <button onClick={() => onOpenModal('recordUsage')} disabled={!room.tenant || room.status !== 'occupied' || !canEdit} className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg px-3 py-1.5 text-center disabled:bg-slate-400 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-800">Ghi Điện Nước</button>
                  <button onClick={onOpenCheckoutModal} disabled={!room.tenant || room.status !== 'occupied' || !canEdit} className="text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:ring-4 focus:outline-none focus:ring-rose-300 rounded-lg px-3 py-1.5 text-center disabled:bg-slate-400 disabled:cursor-not-allowed dark:bg-rose-500 dark:hover:bg-rose-600 dark:focus:ring-rose-800">Trả phòng</button>
                </div>
            </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-xl mb-4 text-slate-800 dark:text-slate-100">
          Lịch Sử Hóa Đơn {room.tenant ? `(${room.tenant.name})` : ''}
        </h3>
        <BillHistory 
            invoices={room.usageHistory} 
            onMarkAsPaid={(invoice) => onMarkAsPaid(room.id, invoice.id)} 
            onOpenInvoice={(invoice) => onOpenInvoice(room, invoice)}
            onOpenEdit={onOpenEditUsageModal}
            onDelete={(invoice) => onDeleteUsageRecord(invoice.id)}
            onViewTenant={(invoice) => onOpenTenantDetail(invoice.tenantSnapshot)}
            canEdit={canEdit}
            displayRoomInfo={false}
        />
      </div>

      {archivedHistoriesByTenant.map((group) => (
        <div key={group.tenant.id} className="mt-8">
          <h3 className="font-semibold text-xl mb-4 text-slate-800 dark:text-slate-100">
            Lịch sử cũ (Người thuê: {group.tenant.name})
          </h3>
          <BillHistory
              invoices={group.records}
              onOpenInvoice={(invoice) => onOpenInvoice(room, invoice)}
              onViewTenant={(invoice) => onOpenTenantDetail(invoice.tenantSnapshot)}
              canEdit={false}
              displayRoomInfo={false}
          />
        </div>
      ))}
    </div>
  );
};

export default RoomDetailView;
