import React from 'react';
import Modal from './Modal';
import { Tenant } from '../types';
import { UserIcon } from './icons';

interface TenantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
}

const TenantDetailModal: React.FC<TenantDetailModalProps> = ({ isOpen, onClose, tenant }) => {
  if (!isOpen || !tenant) return null;

  const DetailItem = ({ label, value }: { label: string, value?: string | null }) => (
    value ? (
      <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">{value}</dd>
      </div>
    ) : null
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi Tiết Người Thuê">
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
           {tenant.avatarUrl ? (
              <img src={tenant.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-slate-300" />
          ) : (
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-slate-400" />
              </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tenant.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{tenant.phone}</p>
          </div>
        </div>
        <dl>
            <DetailItem label="Số CCCD" value={tenant.idNumber} />
            <DetailItem label="Ngày sinh" value={tenant.dateOfBirth ? new Date(tenant.dateOfBirth).toLocaleDateString('vi-VN') : ''} />
            <DetailItem label="Giới tính" value={tenant.sex} />
            <DetailItem label="Quốc tịch" value={tenant.nationality} />
            <DetailItem label="Ngày chuyển vào" value={new Date(tenant.moveInDate).toLocaleDateString('vi-VN')} />
            <DetailItem label="Quê quán" value={tenant.placeOfOrigin} />
            <DetailItem label="Nơi thường trú" value={tenant.placeOfResidence} />
        </dl>
      </div>
       <div className="flex justify-end pt-4 space-x-2 border-t border-slate-200 dark:border-slate-700 mt-4">
            <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Đóng</button>
        </div>
    </Modal>
  );
};

export default TenantDetailModal;