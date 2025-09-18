import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Tenant, Room } from '../types';
import { UserIcon, PlusIcon, PencilIcon, TrashIcon } from './icons';
import EditTenantModal from './EditTenantModal';

interface ManageTenantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTenants: Tenant[]) => void;
  room: Room;
}

const ManageTenantsModal: React.FC<ManageTenantsModalProps> = ({ isOpen, onClose, onSave, room }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTenants(room.tenants || []);
      setIsAdding(false);
      setNewName('');
      setNewPhone('');
      setTenantToEdit(null);
    }
  }, [isOpen, room.tenants]);

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    const newTenant: Tenant = {
      id: crypto.randomUUID(),
      name: newName,
      phone: newPhone,
      moveInDate: new Date().toISOString(),
    };
    setTenants([...tenants, newTenant]);
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
  };

  const handleRemoveTenant = (tenantId: string) => {
    setTenants(tenants.filter(t => t.id !== tenantId));
  };
  
  const handleSaveEditedTenant = (updatedTenant: Tenant) => {
      setTenants(tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t));
      setTenantToEdit(null);
  };

  const handleSaveChanges = () => {
    onSave(tenants);
    onClose();
  };
  
  const inputClass = "bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white";


  return (
    <>
      <Modal isOpen={isOpen && !tenantToEdit} onClose={onClose} title={`Quản lý người thuê - ${room.name}`}>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
          {tenants.map(tenant => (
            <div key={tenant.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                {tenant.avatarUrl ? (
                    <img src={tenant.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover"/>
                ) : (
                    <UserIcon className="w-8 h-8 text-slate-500 flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{tenant.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tenant.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                 <button onClick={() => setTenantToEdit(tenant)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition" title="Sửa thông tin chi tiết"><PencilIcon className="w-5 h-5"/></button>
                 <button onClick={() => handleRemoveTenant(tenant.id)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition" title="Xóa người thuê"><TrashIcon className="w-5 h-5"/></button>
              </div>
            </div>
          ))}

          {tenants.length === 0 && !isAdding && (
            <p className="text-center text-slate-500 py-4">Chưa có người thuê nào. Bấm nút bên dưới để thêm.</p>
          )}

          {isAdding && (
            <form onSubmit={handleAddTenant} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-2 border border-indigo-500 dark:border-indigo-400">
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Thêm người thuê mới</h4>
              <input type="text" placeholder="Tên người thuê" value={newName} onChange={e => setNewName(e.target.value)} className={inputClass} required />
              <input type="tel" placeholder="Số điện thoại" value={newPhone} onChange={e => setNewPhone(e.target.value)} className={inputClass} required />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium px-3 py-1.5 dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500 dark:hover:bg-slate-500">Hủy</button>
                <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium px-3 py-1.5 dark:bg-indigo-500 dark:hover:bg-indigo-600">Thêm</button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="w-full inline-flex items-center justify-center px-4 py-2 border border-dashed border-slate-400 dark:border-slate-500 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <PlusIcon className="w-5 h-5 mr-2" /> Thêm người thuê
            </button>
          )}
        </div>
        <div className="flex justify-end pt-4 space-x-2 mt-4">
            <button type="button" onClick={onClose} className="text-slate-700 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-slate-200 text-sm font-medium px-5 py-2.5 hover:text-slate-900 focus:z-10 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500 dark:hover:text-white dark:hover:bg-slate-600 dark:focus:ring-slate-600">Hủy</button>
            <button type="button" onClick={handleSaveChanges} className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">Lưu thay đổi</button>
        </div>
      </Modal>

      {/* Re-use EditTenantModal for editing a specific tenant */}
      {tenantToEdit && (
        <EditTenantModal 
          isOpen={!!tenantToEdit} 
          onClose={() => setTenantToEdit(null)}
          onEditTenant={handleSaveEditedTenant}
          tenant={tenantToEdit}
        />
      )}
    </>
  );
};

export default ManageTenantsModal;
