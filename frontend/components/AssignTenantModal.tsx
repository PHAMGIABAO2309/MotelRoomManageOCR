
import React, { useState } from 'react';
import Modal from './Modal';
import { Tenant } from '../types';

interface AssignTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignTenant: (tenant: Omit<Tenant, 'id'>) => void;
}

const AssignTenantModal: React.FC<AssignTenantModalProps> = ({ isOpen, onClose, onAssignTenant }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !moveInDate) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    onAssignTenant({ name, phone, moveInDate: new Date(moveInDate).toISOString() });
    setName('');
    setPhone('');
    setMoveInDate(new Date().toISOString().split('T')[0]);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Người Thuê">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tenantName" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Tên người thuê</label>
          <input
            type="text"
            id="tenantName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="tenantPhone" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Số điện thoại</label>
          <input
            type="tel"
            id="tenantPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="moveInDate" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Ngày chuyển vào</label>
          <input
            type="date"
            id="moveInDate"
            value={moveInDate}
            onChange={(e) => setMoveInDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
         <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Hủy</button>
            <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">Thêm</button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignTenantModal;