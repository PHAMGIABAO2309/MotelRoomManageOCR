import React from 'react';
import { Room, UsageRecord, User, Tenant } from '../types';
import { UserIcon, PrinterIcon, IdentificationIcon, QrCodeIcon, UsersIcon } from './icons';
import { ELECTRIC_RATE, WATER_RATE } from '../constants';

const BillHistoryForTenant: React.FC<{
    room: Room; 
    history: UsageRecord[],
    onOpenInvoice: (room: Room, record: UsageRecord) => void;
    onOpenPaymentQR: (room: Room, record: UsageRecord) => void;
}> = ({ room, history, onOpenInvoice, onOpenPaymentQR }) => {
    if (history.length === 0) {
        return <p className="text-center text-slate-500 dark:text-slate-400 mt-4">Chưa có lịch sử ghi điện nước.</p>;
    }

    const reversedHistory = [...history].reverse();

    return (
        <>
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">Kỳ Thanh Toán</th>
                            <th scope="col" className="px-4 py-3">Điện (kWh)</th>
                            <th scope="col" className="px-4 py-3">Nước (m³)</th>
                            <th scope="col" className="px-4 py-3">Tổng Tiền (VND)</th>
                            <th scope="col" className="px-4 py-3">Trạng Thái</th>
                            <th scope="col" className="px-4 py-3 text-center">Hóa đơn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reversedHistory.map(record => (
                            <tr key={record.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-4 py-4">{new Date(record.startDate).toLocaleDateString('vi-VN')} - {new Date(record.endDate).toLocaleDateString('vi-VN')}</td>
                                <td className="px-4 py-4">{record.electricUsage} ({record.electricReading})</td>
                                <td className="px-4 py-4">{record.waterUsage} ({record.waterReading})</td>
                                <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{record.billAmount.toLocaleString('vi-VN')}</td>
                                <td className="px-4 py-4">
                                     {record.isPaid ? (
                                        <span className="font-semibold text-teal-500">Đã thanh toán</span>
                                     ) : (
                                        <button onClick={() => onOpenPaymentQR(room, record)} className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800">
                                            <QrCodeIcon className="w-4 h-4 mr-1.5"/>
                                            Thanh toán QR
                                        </button>
                                     )}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <button onClick={() => onOpenInvoice(room, record)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white transition" title="In hóa đơn">
                                        <PrinterIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {reversedHistory.map(record => (
                    <div key={record.id} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">Kỳ: {new Date(record.startDate).toLocaleDateString('vi-VN')} - {new Date(record.endDate).toLocaleDateString('vi-VN')}</p>
                                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{record.billAmount.toLocaleString('vi-VN')} VND</p>
                            </div>
                            <button onClick={() => onOpenInvoice(room, record)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white transition" title="In hóa đơn">
                                <PrinterIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-600 pt-2">
                             <p><strong>Điện:</strong> {record.electricUsage} kWh (Chỉ số: {record.electricReading})</p>
                             <p><strong>Nước:</strong> {record.waterUsage} m³ (Chỉ số: {record.waterReading})</p>
                        </div>
                        <div className="mt-3">
                             {record.isPaid ? (
                                <span className="font-semibold text-sm text-teal-600 dark:text-teal-400">✓ Đã thanh toán</span>
                             ) : (
                                <button onClick={() => onOpenPaymentQR(room, record)} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800">
                                    <QrCodeIcon className="w-5 h-5 mr-2"/>
                                    Thanh toán qua QR
                                </button>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

interface TenantViewProps {
    room: Room;
    currentUser: User;
    onOpenInvoice: (room: Room, record: UsageRecord) => void;
    onOpenPaymentQRModal: (room: Room, record: UsageRecord) => void;
}

const TenantView: React.FC<TenantViewProps> = ({ room, currentUser, onOpenInvoice, onOpenPaymentQRModal }) => {
  const selfTenant = room.tenants.find(t => t.id === currentUser.id);
  const otherTenants = room.tenants.filter(t => t.id !== currentUser.id);

  if (!selfTenant) {
    return <p>Lỗi: Không tìm thấy thông tin người thuê.</p>
  }

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 shadow-lg rounded-lg animate-fade-in-left border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Thông tin phòng {room.name}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Tenant Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-lg mb-3 text-slate-800 dark:text-slate-100 flex items-center"><UserIcon className="mr-2"/>Thông Tin Cá Nhân</h3>
            <div className="flex items-start space-x-4">
                 {selfTenant.avatarUrl ? (
                    <img src={selfTenant.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-lg object-cover border-2 border-slate-300 dark:border-slate-600" />
                ) : (
                    <div className="w-24 h-24 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-slate-400" />
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm flex-1 text-slate-700 dark:text-slate-300">
                    <div className="sm:col-span-2">
                        <p><strong>Tên:</strong> {selfTenant.name}</p>
                    </div>
                    {selfTenant.dateOfBirth && <div><p><strong>Ngày sinh:</strong> {new Date(selfTenant.dateOfBirth).toLocaleDateString('vi-VN')}</p></div>}
                    {selfTenant.sex && <div><p><strong>Giới tính:</strong> {selfTenant.sex}</p></div>}
                    {selfTenant.idNumber && <div><p><strong>CCCD:</strong> {selfTenant.idNumber}</p></div>}
                    {selfTenant.occupation && <div><p><strong>Nghề nghiệp:</strong> {selfTenant.occupation}</p></div>}
                    <div><p><strong>SĐT:</strong> {selfTenant.phone}</p></div>
                    <div><p><strong>Ngày vào:</strong> {new Date(selfTenant.moveInDate).toLocaleDateString('vi-VN')}</p></div>
                </div>
            </div>
             {otherTenants.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <h4 className="font-semibold text-md mb-2 text-slate-800 dark:text-slate-100 flex items-center"><UsersIcon className="mr-2"/>Bạn cùng phòng</h4>
                    <div className="space-y-2">
                        {otherTenants.map(tenant => (
                            <div key={tenant.id} className="flex items-center space-x-3 p-2 bg-white dark:bg-slate-700/50 rounded-md">
                                {tenant.avatarUrl ? <img src={tenant.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" /> : <UserIcon className="w-8 h-8 p-1 text-slate-400 bg-slate-200 dark:bg-slate-600 rounded-full"/>}
                                <span className="text-sm text-slate-700 dark:text-slate-300">{tenant.name} - {tenant.phone}</span>
                            </div>
                        ))}
                    </div>
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
            </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-xl mb-4 text-slate-800 dark:text-slate-100">Lịch Sử Hóa Đơn</h3>
        <BillHistoryForTenant 
            room={room}
            history={room.usageHistory} 
            onOpenInvoice={onOpenInvoice}
            onOpenPaymentQR={onOpenPaymentQRModal}
        />
      </div>
    </div>
  );
};

export default TenantView;