import React from 'react';
import { ModalType } from '../types';

import AddRoomModal from './AddRoomModal';
import AssignTenantModal from './AssignTenantModal';
import RecordUsageModal from './RecordUsageModal';
import EditTenantModal from './EditTenantModal';
import TenantDetailModal from './TenantDetailModal';
import UserModal from './UserModal';
import InvoiceModal from './InvoiceModal';
import ConfirmModal from './ConfirmModal';

const ModalManager: React.FC<{ appLogic: any }> = ({ appLogic }) => {
    const {
        activeModal, selectedRoom, suggestedRoomInfo, recordToEdit, tenantToShow, userToEdit,
        invoiceToView, isLogoutConfirmOpen, userToDelete, invoiceToDelete,
        closeModal, handleAddRoom, handleAssignTenant, handleEditTenant, handleSaveUsage,
        handleAddUser, handleUpdateUser, handleCloseInvoiceModal,
        setIsLogoutConfirmOpen, handleLogout, setUserToDelete, handleDeleteUser,
        setInvoiceToDelete, handleConfirmDeleteInvoice,
    } = appLogic;

    if (!selectedRoom && [ModalType.ASSIGN_TENANT, ModalType.RECORD_USAGE, ModalType.EDIT_TENANT, ModalType.EDIT_USAGE, ModalType.TENANT_DETAIL, ModalType.CHECK_OUT].includes(activeModal)) {
        return null;
    }

    return (
        <>
            {(() => {
                switch (activeModal) {
                    case ModalType.ADD_ROOM: return <AddRoomModal isOpen={true} onClose={closeModal} onAddRoom={handleAddRoom} suggestedName={suggestedRoomInfo.name} suggestedRent={suggestedRoomInfo.rent} />;
                    case ModalType.ASSIGN_TENANT: return <AssignTenantModal isOpen={true} onClose={closeModal} onAssignTenant={handleAssignTenant} />;
                    case ModalType.RECORD_USAGE: return <RecordUsageModal isOpen={true} onClose={closeModal} onSave={handleSaveUsage} room={selectedRoom!} />;
                    case ModalType.EDIT_USAGE: return <RecordUsageModal isOpen={true} onClose={closeModal} onSave={handleSaveUsage} room={selectedRoom!} recordToEdit={recordToEdit} />;
                    case ModalType.CHECK_OUT: return <RecordUsageModal isOpen={true} onClose={closeModal} onSave={handleSaveUsage} room={selectedRoom!} mode="checkout" />;
                    case ModalType.EDIT_TENANT: return <EditTenantModal isOpen={true} onClose={closeModal} onEditTenant={handleEditTenant} tenant={selectedRoom!.tenant!} />;
                    case ModalType.TENANT_DETAIL: return <TenantDetailModal isOpen={true} onClose={closeModal} tenant={tenantToShow} />
                    case ModalType.ADD_USER: return <UserModal isOpen={true} onClose={closeModal} onSave={handleAddUser} />;
                    case ModalType.EDIT_USER: return <UserModal isOpen={true} onClose={closeModal} onSave={handleUpdateUser} userToEdit={userToEdit} />;
                    default: return null;
                }
            })()}

            {invoiceToView && (
                <InvoiceModal
                    isOpen={true}
                    onClose={handleCloseInvoiceModal}
                    room={invoiceToView.room}
                    record={invoiceToView.record}
                />
            )}
            <ConfirmModal
                isOpen={isLogoutConfirmOpen}
                onClose={() => setIsLogoutConfirmOpen(false)}
                onConfirm={handleLogout}
                title="Xác nhận đăng xuất"
                message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
                confirmText="Đăng xuất"
            />
            <ConfirmModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDeleteUser}
                title="Xác nhận xóa người dùng"
                message={<>Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.name}</strong>? Hành động này không thể hoàn tác.</>}
                confirmText="Xóa"
            />
            <ConfirmModal
                isOpen={!!invoiceToDelete}
                onClose={() => setInvoiceToDelete(null)}
                onConfirm={handleConfirmDeleteInvoice}
                title="Xác nhận xóa hóa đơn"
                message={<>Bạn có chắc chắn muốn xóa hóa đơn này? Hành động này không thể hoàn tác.</>}
                confirmText="Xóa"
            />
        </>
    );
};

export default ModalManager;