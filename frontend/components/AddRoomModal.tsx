import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoom: (name: string, baseRent: number) => void;
  suggestedName?: string;
  suggestedRent?: number;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ isOpen, onClose, onAddRoom, suggestedName, suggestedRent }) => {
  const [name, setName] = useState(suggestedName || '');
  const [baseRent, setBaseRent] = useState(suggestedRent ? String(suggestedRent) : '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(suggestedName || '');
      setBaseRent(suggestedRent ? String(suggestedRent) : '');
      setError('');
    }
  }, [isOpen, suggestedName, suggestedRent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !baseRent.trim() || isNaN(Number(baseRent)) || Number(baseRent) <= 0) {
      setError('Vui lòng nhập thông tin hợp lệ.');
      return;
    }
    onAddRoom(name, Number(baseRent));
    setName('');
    setBaseRent('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Phòng Mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="roomName" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Tên phòng</label>
          <input
            type="text"
            id="roomName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
            placeholder="Ví dụ: Phòng 101"
            required
          />
        </div>
        <div>
          <label htmlFor="baseRent" className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">Giá thuê cơ bản (VND)</label>
          <input
            type="number"
            id="baseRent"
            value={baseRent}
            onChange={(e) => setBaseRent(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
            placeholder="Ví dụ: 2000000"
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Hủy</button>
            <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">Thêm phòng</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRoomModal;