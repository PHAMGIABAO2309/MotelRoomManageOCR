import React from 'react';
import Modal from './Modal';
import { Room, UsageRecord } from '../types';
import { LANDLORD_INFO, ELECTRIC_RATE, WATER_RATE } from '../constants';
import { numberToWords } from '../utils/numberToWords';
import { PrinterIcon } from './icons';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  record: UsageRecord;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, room, record }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };
  
  const recordIndex = room.usageHistory.findIndex(r => r.id === record.id);
  const prevRecord = recordIndex > 0 ? room.usageHistory[recordIndex - 1] : null;

  const prevElectricReading = prevRecord?.electricReading || 0;
  const prevWaterReading = prevRecord?.waterReading || 0;
  
  const electricBill = record.electricUsage * ELECTRIC_RATE;
  const waterBill = record.waterUsage * WATER_RATE;
  
  const paymentPeriod = `${new Date(record.startDate).toLocaleDateString('vi-VN')} - ${new Date(record.endDate).toLocaleDateString('vi-VN')}`;
  
  const tenantNames = record.tenantsSnapshot.map(t => t.name).join(', ');

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Hóa Đơn Tiền Nhà">
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <div id="invoice-paper" className="bg-white text-gray-800 p-6 mx-auto max-w-lg shadow-lg rounded-md font-sans">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-lg font-bold uppercase">{LANDLORD_INFO.name}</h2>
            <p className="text-xs">{LANDLORD_INFO.address}</p>
            <p className="text-xs">SĐT: {LANDLORD_INFO.phone}</p>
            <h1 className="text-2xl font-bold uppercase my-4">PHIẾU BÁO TIỀN NHÀ</h1>
            <p className="text-sm">Ngày báo: {new Date(record.endDate).toLocaleDateString('vi-VN')}</p>
          </div>
          
          <hr className="border-dashed my-4" />

          {/* Customer Info */}
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span>Người thuê:</span> <span className="font-semibold text-right">{tenantNames}</span></div>
            <div className="flex justify-between"><span>Phòng:</span> <span className="font-semibold">{room.name}</span></div>
            <div className="flex justify-between"><span>Kỳ thanh toán:</span> <span className="font-semibold">{paymentPeriod}</span></div>
          </div>
          
          <hr className="border-dashed my-4" />
          
          {/* Line Items */}
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>1. Tiền thuê phòng</span>
              <span className="font-semibold">{room.baseRent.toLocaleString('vi-VN')}</span>
            </div>
            
            <div>
              <div className="flex justify-between">
                <span>2. Tiền điện</span>
                <span className="font-semibold">{electricBill.toLocaleString('vi-VN')}</span>
              </div>
              <p className="text-xs text-gray-500 ml-4">
                (CS cũ: {prevElectricReading}, CS mới: {record.electricReading} | Sử dụng: {record.electricUsage} kWh x {ELECTRIC_RATE.toLocaleString('vi-VN')})
              </p>
            </div>
            
            <div>
              <div className="flex justify-between">
                <span>3. Tiền nước</span>
                <span className="font-semibold">{waterBill.toLocaleString('vi-VN')}</span>
              </div>
               <p className="text-xs text-gray-500 ml-4">
                (CS cũ: {prevWaterReading}, CS mới: {record.waterReading} | Sử dụng: {record.waterUsage} m³ x {WATER_RATE.toLocaleString('vi-VN')})
              </p>
            </div>
          </div>
          
          <hr className="border-dashed my-4 border-black" />

          {/* Total */}
          <div className="space-y-2">
             <div className="flex justify-between font-bold text-lg">
              <span>TỔNG CỘNG</span>
              <span>{record.billAmount.toLocaleString('vi-VN')} VND</span>
            </div>
            <p className="text-sm italic text-right">
              (Bằng chữ: {numberToWords(record.billAmount)} đồng)
            </p>
          </div>

          <hr className="border-dashed my-4" />
          
          {/* Footer */}
          <div className="text-xs text-gray-600 mt-6">
            <p className="font-semibold">Vui lòng thanh toán trước ngày ...</p>
            <p>Chuyển khoản đến STK: <span className="font-mono">{LANDLORD_INFO.bankAccount}</span> ({LANDLORD_INFO.bankName})</p>
            <p>Chủ tài khoản: {LANDLORD_INFO.accountHolder}</p>
          </div>

           <div className="text-center mt-8 text-sm">
              <p>Ngày ..... tháng ..... năm .....</p>
              <div className="flex justify-around mt-2">
                <div>
                    <p className="font-bold">Người lập phiếu</p>
                    <p className="mt-12">(Ký, họ tên)</p>
                </div>
                <div>
                    <p className="font-bold">Người nộp tiền</p>
                    <p className="mt-12">(Ký, họ tên)</p>
                </div>
            </div>
           </div>
        </div>
      </div>
        <div className="flex justify-end pt-4 space-x-2 border-t mt-4 no-print border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Đóng</button>
            <button type="button" onClick={handlePrint} className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 inline-flex items-center">
                <PrinterIcon className="w-4 h-4 mr-2" /> In Hóa Đơn
            </button>
        </div>
    </Modal>
    <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            .no-print {
                display: none !important;
            }
            #root > div > div:first-of-type {
              display: none !important;
              visibility: hidden !important;
            }
            #invoice-paper, #invoice-paper * {
                visibility: visible;
            }
            #invoice-paper {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                max-width: 100%;
                margin: 0;
                padding: 0;
                border: none;
                box-shadow: none;
                border-radius: 0;
                background: white !important;
                color: black !important;
                font-size: 12pt;
            }
            h1, h2, span, p, strong, div {
                color: black !important;
            }
            hr {
                border-color: #666 !important;
            }
        }
    `}</style>
    </>
  );
};

export default InvoiceModal;