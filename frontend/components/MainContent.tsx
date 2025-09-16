import React from 'react';
import { Room, ModalType, PageType } from '../types';

import RoomCard from './RoomCard';
import RoomDetailView from './RoomDetailView';
import UserManagementView from './UserManagementView';
import InvoiceManagementView from './InvoiceManagementView';
import EditProfileView from './EditProfileView';
import TenantView from './TenantView';

const MainContent: React.FC<{ appLogic: any }> = ({ appLogic }) => {
    const {
        rooms, selectedRoom, currentUser, tenantRoom, currentPage,
        searchQuery, draggedItem, dragOverItem, userSearchQuery, userCurrentPage,
        openModal, handleMarkAsPaid, handleRemoveTenant, handleOpenInvoiceModal,
        handleOpenEditUsageModal, handleOpenDeleteInvoiceConfirm, handleOpenTenantDetailModal,
        handleOpenAddUserModal, handleOpenEditUserModal, handleOpenDeleteUserConfirm,
        handleUpdateProfile, handleNavigateBackToGrid,
        handleDragStart, handleDragEnter, handleDragEnd,
        handleTouchStart, handleTouchMove, handleTouchEnd,
        handleUserPageChange, handleTogglePin,
        filteredRooms, paginatedUsers, totalUserPages, filteredUsers,
        canEdit,
        setSelectedRoom, setSearchQuery, setUserSearchQuery, handleOpenCheckoutModal,
        // Invoice Page Props
        paginatedInvoices, totalInvoicePages, invoiceCurrentPage, invoiceFilterRoomId, invoiceFilterStatus, invoiceSortBy, invoiceSearchQuery,
        setInvoiceFilterRoomId, setInvoiceFilterStatus, setInvoiceSortBy, setInvoiceSearchQuery,
        handleInvoicePageChange, handleExportInvoicesToExcel, filteredAndSortedInvoices,
        handleEditInvoiceFromMgmt, handleDeleteInvoiceFromMgmt, handleViewTenantFromMgmt
    } = appLogic;

    const handleOpenModal = (type: 'assignTenant' | 'recordUsage' | 'editTenant') => {
        switch (type) {
            case 'assignTenant': openModal(ModalType.ASSIGN_TENANT); break;
            case 'recordUsage': openModal(ModalType.RECORD_USAGE); break;
            case 'editTenant': openModal(ModalType.EDIT_TENANT); break;
        }
    }

    if (currentUser?.role === 'Tenant') {
        if (!tenantRoom) return <p>Đang tải thông tin phòng...</p>;
        return <TenantView room={tenantRoom} onOpenInvoice={handleOpenInvoiceModal} />;
    }

    switch (currentPage) {
        case PageType.USER_MANAGEMENT:
            return (
                <UserManagementView
                    users={paginatedUsers}
                    onAdd={handleOpenAddUserModal}
                    onEdit={handleOpenEditUserModal}
                    onDelete={handleOpenDeleteUserConfirm}
                    canEdit={canEdit}
                    searchQuery={userSearchQuery}
                    onSearchChange={setUserSearchQuery}
                    currentPage={userCurrentPage}
                    totalPages={totalUserPages}
                    onPageChange={handleUserPageChange}
                    totalUsers={filteredUsers.length}
                />
            );
        case PageType.INVOICE_MANAGEMENT:
            return (
                <InvoiceManagementView
                    rooms={rooms}
                    invoices={paginatedInvoices}
                    totalInvoices={filteredAndSortedInvoices.length}
                    totalPages={totalInvoicePages}
                    currentPage={invoiceCurrentPage}
                    onPageChange={handleInvoicePageChange}
                    searchQuery={invoiceSearchQuery}
                    onSearchQueryChange={setInvoiceSearchQuery}
                    filterRoomId={invoiceFilterRoomId}
                    onFilterRoomIdChange={setInvoiceFilterRoomId}
                    filterStatus={invoiceFilterStatus}
                    onFilterStatusChange={setInvoiceFilterStatus}
                    sortBy={invoiceSortBy}
                    onSortByChange={setInvoiceSortBy}
                    onOpenInvoice={handleOpenInvoiceModal}
                    onMarkAsPaid={handleMarkAsPaid}
                    canEdit={canEdit}
                    onExportToExcel={handleExportInvoicesToExcel}
                    onEditInvoice={handleEditInvoiceFromMgmt}
                    onDeleteInvoice={handleDeleteInvoiceFromMgmt}
                    onViewTenant={handleViewTenantFromMgmt}
                />
            );
        case PageType.EDIT_PROFILE:
            if (!currentUser) {
                handleNavigateBackToGrid();
                return null;
            }
            return (
                <EditProfileView
                    currentUser={currentUser}
                    onSaveProfile={handleUpdateProfile}
                    onBack={handleNavigateBackToGrid}
                />
            );
        case PageType.ROOM_GRID:
        default:
            if (selectedRoom) {
                return (
                    <RoomDetailView
                        room={selectedRoom}
                        onBack={() => { setSelectedRoom(null); setSearchQuery(''); }}
                        onOpenModal={handleOpenModal}
                        onMarkAsPaid={handleMarkAsPaid}
                        onRemoveTenant={handleRemoveTenant}
                        onOpenInvoice={handleOpenInvoiceModal}
                        onOpenEditUsageModal={handleOpenEditUsageModal}
                        onDeleteUsageRecord={handleOpenDeleteInvoiceConfirm}
                        onOpenTenantDetail={handleOpenTenantDetailModal}
                        canEdit={canEdit}
                        onOpenCheckoutModal={handleOpenCheckoutModal}
                    />
                );
            }

            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {filteredRooms.map((room: Room) => (
                        <RoomCard 
                            key={room.id} 
                            room={room} 
                            onSelectRoom={setSelectedRoom} 
                            searchQuery={searchQuery} 
                            draggedItem={draggedItem} 
                            dragOverItem={dragOverItem} 
                            onDragStart={(e, room) => handleDragStart(room)} 
                            onDragEnter={(e, room) => handleDragEnter(room)} 
                            onDragEnd={handleDragEnd} 
                            onTogglePin={handleTogglePin}
                            onTouchStart={(e) => handleTouchStart(e, room)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        />
                    ))}
                    {filteredRooms.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{searchQuery ? `Không tìm thấy phòng khớp với "${searchQuery}"` : 'Chưa có phòng nào'}</h3>
                            <p className="text-slate-500 mt-2">{searchQuery ? 'Hãy thử một từ khóa khác hoặc xóa bộ lọc.' : 'Bấm "Thêm Phòng" để bắt đầu quản lý.'}</p>
                        </div>
                    )}
                </div>
            );
    }
};

export default MainContent;