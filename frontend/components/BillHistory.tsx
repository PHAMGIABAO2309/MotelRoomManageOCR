import React from 'react';
import { UsageRecord } from '../types';
import { PencilIcon, PrinterIcon, TrashIcon, IdentificationIcon } from './icons';

// The invoice object passed to handlers will have this shape
type InvoiceWithRoomInfo = UsageRecord & { roomId?: string; roomName?: string };

interface BillHistoryProps {
    invoices: InvoiceWithRoomInfo[];
    onMarkAsPaid?: (invoice: InvoiceWithRoomInfo) => void;
    onOpenInvoice: (invoice: InvoiceWithRoomInfo) => void;
    onOpenEdit?: (invoice: InvoiceWithRoomInfo) => void;
    onDelete?: (invoice: InvoiceWithRoomInfo) => void;
    onViewTenant: (invoice: InvoiceWithRoomInfo) => void;
    canEdit: boolean;
    displayRoomInfo?: boolean; // To show the 'Room' column
}

const BillHistory: React.FC<BillHistoryProps> = ({ 
    invoices, 
    onMarkAsPaid, 
    onOpenInvoice, 
    onOpenEdit, 
    onDelete, 
    onViewTenant, 
    canEdit, 
    displayRoomInfo = false 
}) => {
    if (invoices.length === 0) {
        return <p className="text-center text-slate-500 dark:text-slate-400 py-8">Chưa có lịch sử hóa đơn.</p>;
    }

    const reversedHistory = [...invoices].reverse();

    return (
        <>
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-400">
                        <tr>
                            {displayRoomInfo && <th scope="col" className="px-4 py-3">Phòng / Người thuê</th>}
                            <th scope="col" className="px-4 py-3">Kỳ Thanh Toán</th>
                            <th scope="col" className="px-4 py-3">Điện (kWh)</th>
                            <th scope="col" className="px-4 py-3">Nước (m³)</th>
                            <th scope="col" className="px-4 py-3">Tổng Tiền (VND)</th>
                            <th scope="col" className="px-4 py-3">Trạng Thái</th>
                            <th scope="col" className="px-4 py-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reversedHistory.map(record => (
                            <tr key={record.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                {displayRoomInfo && (
                                     <td className="px-4 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white">{record.roomName}</div>
                                        <div className="text-slate-500">{record.tenantSnapshot.name}</div>
                                    </td>
                                )}
                                <td className="px-4 py-4">{new Date(record.startDate).toLocaleDateString('vi-VN')} - {new Date(record.endDate).toLocaleDateString('vi-VN')}</td>
                                <td className="px-4 py-4">{record.electricUsage} ({record.electricReading})</td>
                                <td className="px-4 py-4">{record.waterUsage} ({record.waterReading})</td>
                                <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{record.billAmount.toLocaleString('vi-VN')}</td>
                                <td className="px-4 py-4">
                                    {record.isPaid ? (
                                        <span className="text-teal-500 font-semibold">Đã thanh toán</span>
                                    ) : (
                                        <button disabled={!canEdit} onClick={() => onMarkAsPaid && onMarkAsPaid(record)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed">Đánh dấu đã trả</button>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onViewTenant(record)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white transition" title="Xem chi tiết người thuê">
                                            <IdentificationIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onOpenInvoice(record)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white transition" title="In hóa đơn">
                                            <PrinterIcon className="w-5 h-5" />
                                        </button>
                                         <button disabled={!canEdit} onClick={() => onOpenEdit && onOpenEdit(record)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition" title="Sửa hóa đơn">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                         <button disabled={!canEdit} onClick={() => onDelete && onDelete(record)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition" title="Xóa hóa đơn">
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
            <div className="md:hidden space-y-3">
                {reversedHistory.map(record => (
                    <div key={record.id} className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                {displayRoomInfo && <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{record.roomName} / {record.tenantSnapshot.name}</p>}
                                <p className="font-semibold text-slate-800 dark:text-slate-100">Kỳ: {new Date(record.startDate).toLocaleDateString('vi-VN')} - {new Date(record.endDate).toLocaleDateString('vi-VN')}</p>
                                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{record.billAmount.toLocaleString('vi-VN')} VND</p>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => onViewTenant(record)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white transition" title="Xem chi tiết người thuê">
                                    <IdentificationIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onOpenInvoice(record)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white transition" title="In hóa đơn">
                                    <PrinterIcon className="w-5 h-5" />
                                </button>
                                <button disabled={!canEdit} onClick={() => onOpenEdit && onOpenEdit(record)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition" title="Sửa hóa đơn">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button disabled={!canEdit} onClick={() => onDelete && onDelete(record)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition" title="Xóa hóa đơn">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-600 pt-2">
                             <p><strong>Điện:</strong> {record.electricUsage} kWh (Chỉ số: {record.electricReading})</p>
                             <p><strong>Nước:</strong> {record.waterUsage} m³ (Chỉ số: {record.waterReading})</p>
                        </div>
                        <div className="mt-3">
                            {record.isPaid ? (
                                <span className="text-teal-600 dark:text-teal-400 font-semibold text-sm">✓ Đã thanh toán</span>
                            ) : (
                                <button disabled={!canEdit} onClick={() => onMarkAsPaid && onMarkAsPaid(record)} className="w-full text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg px-3 py-1.5 text-center dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-800 disabled:bg-slate-400 disabled:cursor-not-allowed">Đánh dấu đã trả</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default BillHistory;
