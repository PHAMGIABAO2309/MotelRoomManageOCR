import React from 'react';
import Modal from './Modal';
import { Room, UsageRecord } from '../types';
import { LANDLORD_INFO } from '../constants';
import { CheckCircleIcon } from './icons';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: Room;
  record: UsageRecord;
}

const PaymentQRModal: React.FC<PaymentQRModalProps> = ({ isOpen, onClose, onConfirm, room, record }) => {
  if (!isOpen) return null;

  const month = new Date(record.endDate).getMonth() + 1;
  const year = new Date(record.endDate).getFullYear();
  const paymentDetails = `TT tien nha P${room.name.match(/\d+/)?.[0] || room.name} T${month} ${year}`;
  
  const vietQRUrl = `https://img.vietqr.io/image/${LANDLORD_INFO.bankBin}-${LANDLORD_INFO.bankAccount}-compact2.png?amount=${record.billAmount}&addInfo=${encodeURIComponent(paymentDetails)}&accountName=${encodeURIComponent(LANDLORD_INFO.accountHolder)}`;

  const DetailItem = ({ label, value, isMono=false }: { label: string; value: string; isMono?: boolean }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200 dark:border-slate-700">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`font-semibold text-slate-800 dark:text-slate-100 ${isMono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thanh toán hóa đơn">
      <div className="max-h-[70vh] overflow-y-auto pr-2 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          Quét mã QR bằng ứng dụng ngân hàng của bạn để thanh toán.
        </p>

        <div className="my-4 flex justify-center">
            <img src={vietQRUrl} alt="VietQR Code" className="w-64 h-64 rounded-lg shadow-lg border-4 border-white dark:border-slate-700"/>
        </div>

        <div className="text-left space-y-1 mb-6">
            <DetailItem label="Số tiền" value={`${record.billAmount.toLocaleString('vi-VN')} VND`} />
            <DetailItem label="Ngân hàng" value={LANDLORD_INFO.bankName} />
            <DetailItem label="Số tài khoản" value={LANDLORD_INFO.bankAccount} isMono={true} />
            <DetailItem label="Chủ tài khoản" value={LANDLORD_INFO.accountHolder} />
            <DetailItem label="Nội dung" value={paymentDetails} />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 px-4">
            Sau khi hoàn tất chuyển khoản trên ứng dụng ngân hàng, vui lòng nhấn nút xác nhận bên dưới.
        </p>
      </div>

       <div className="flex justify-end pt-6 space-x-2 border-t border-slate-200 dark:border-slate-700 mt-6">
            <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Hủy</button>
            <button type="button" onClick={onConfirm} className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 inline-flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Tôi đã thanh toán
            </button>
        </div>
    </Modal>
  );
};

export default PaymentQRModal;
